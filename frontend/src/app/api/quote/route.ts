import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:4000";
const DATA_FILE = path.join(process.cwd(), ".data", "inquiries.ndjson");
const limits: Record<string, number> = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  division: 240,
  partName: 240,
  quantity: 100,
  message: 6000,
  website: 200,
};

// Best-effort instance-level abuse protection. Use an edge/shared rate limiter in production.
const attempts = new Map<string, { count: number; reset: number }>();
function rateLimited(req: NextRequest) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.reset <= now) attempts.delete(key);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const entry = attempts.get(ip) || { count: 0, reset: now + 10 * 60 * 1000 };
  entry.count++;
  attempts.set(ip, entry);
  return entry.count > 10;
}

export async function POST(req: NextRequest) {
  if (rateLimited(req))
    return NextResponse.json(
      {
        error:
          "Too many requests. Please try again later or contact S Square directly.",
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 16000)
      return NextResponse.json(
        {
          error:
            "Your enquiry is too long. Please send drawings and documents directly by email.",
        },
        { status: 413 },
      );
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("Invalid object");
    body = parsed;
  } catch {
    return NextResponse.json(
      { error: "Invalid enquiry. Please check the form and try again." },
      { status: 400 },
    );
  }

  const data: Record<string, string> = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = body[field];
    if (value !== undefined && typeof value !== "string")
      return NextResponse.json(
        { error: "Please use plain text for your enquiry details." },
        { status: 400 },
      );
    data[field] = String(value || "").trim();
    if (data[field].length > max)
      return NextResponse.json(
        {
          error: `The ${field} field is too long (maximum ${max} characters).`,
        },
        { status: 400 },
      );
  }
  const { name, company, email, phone, partName, quantity, message } = data;
  const division = data.division || "Multi-Material / Custom Specification";
  if (data.website)
    return NextResponse.json(
      {
        error:
          "Unable to process this enquiry. Please contact S Square directly.",
      },
      { status: 400 },
    );
  if (name.length < 2 || (!email && !phone) || message.length < 10)
    return NextResponse.json(
      {
        error:
          "Please provide your name, an email or phone number, and at least 10 characters about your project.",
      },
      { status: 400 },
    );
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  if (
    phone &&
    (!/^[+\d\s().-]+$/.test(phone) ||
      phone.replace(/\D/g, "").length < 7 ||
      phone.replace(/\D/g, "").length > 15)
  )
    return NextResponse.json(
      {
        error: "Please enter a valid phone number including your country code.",
      },
      { status: 400 },
    );

  let referenceId = `SSQ-RFQ-${randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = new Date().toISOString();
  let savedToBackend = false,
    savedLocally = false,
    emailDispatched = false,
    webhookDispatched = false;
  const enquiry = {
    name,
    company,
    email,
    phone,
    division,
    partName,
    quantity,
    message,
  };
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/orders/rfq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RFQ_API_KEY
          ? { "x-rfq-api-key": process.env.RFQ_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        ...enquiry,
        email: email || "not-provided@client.local",
        phone: phone || "Not provided",
        country: "Not specified",
        drawingAvailable: "Discuss directly",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const payload = await response.json();
      referenceId = payload?.data?.referenceId || referenceId;
      savedToBackend = true;
    }
  } catch {
    /* A local fallback is attempted below; never imply delivery. */
  }

  if (!savedToBackend) {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      // Append rather than read-modify-write, so concurrent enquiries are not lost.
      await fs.appendFile(
        DATA_FILE,
        `${JSON.stringify({ referenceId, submittedAt, ...enquiry })}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
      savedLocally = true;
    } catch {
      /* Read-only/serverless hosts may not support local storage. */
    }
  }

  const text = [
    `Reference: ${referenceId}`,
    `Submitted: ${submittedAt}`,
    `Name: ${name}`,
    `Company: ${company || "Not specified"}`,
    `Email: ${email || "Not specified"}`,
    `Phone / WhatsApp: ${phone || "Not specified"}`,
    `Material / product: ${division}`,
    `Part: ${partName || "See requirements"}`,
    `Quantity: ${quantity || "To discuss"}`,
    "",
    message,
  ].join("\n");
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": referenceId,
        },
        body: JSON.stringify({
          from:
            process.env.QUOTE_FROM_EMAIL ||
            "S Square Quotes <quotes@ssquareengg.com>",
          to: [process.env.QUOTE_TO_EMAIL || "sales@ssquareengg.com"],
          reply_to: email || undefined,
          subject: `[${referenceId}] Quote enquiry – ${(partName || division).replace(/[\r\n]/g, " ")}`,
          text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      emailDispatched = response.ok;
    } catch {
      /* Offer direct dispatch if the provider is unavailable. */
    }
  }
  if (!emailDispatched && process.env.QUOTE_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.QUOTE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.QUOTE_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${process.env.QUOTE_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ referenceId, submittedAt, ...enquiry }),
        signal: AbortSignal.timeout(8000),
      });
      webhookDispatched = response.ok;
    } catch {
      /* Do not report an unsuccessful webhook as an email. */
    }
  }
  if (
    !savedToBackend &&
    !savedLocally &&
    !emailDispatched &&
    !webhookDispatched
  ) {
    return NextResponse.json(
      {
        error:
          "Your enquiry could not be saved or delivered. Please send it directly by WhatsApp or email using the links below.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json(
    {
      referenceId,
      submittedAt,
      savedToBackend,
      savedLocally,
      emailDispatched,
      webhookDispatched,
    },
    { status: 201 },
  );
}
