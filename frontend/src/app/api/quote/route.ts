import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:4000";
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const division = String(body.division ?? "Multi-Material / General").trim();
    const partName = String(body.partName ?? "").trim();
    const quantity = String(body.quantity ?? "").trim();
    const country = String(body.country ?? "India").trim();
    const drawingAvailable = String(
      body.drawingAvailable ?? "Yes – CAD / PDF Ready"
    ).trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        {
          error:
            "Please complete your name, business email, phone/WhatsApp number, and project specification.",
        },
        { status: 400 }
      );
    }

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/v1/orders/rfq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          division,
          partName,
          quantity,
          country,
          drawingAvailable,
          message,
        }),
      });

      if (backendRes.ok) {
        const payload = await backendRes.json();
        const refId =
          payload?.data?.referenceId ||
          `SSQ-RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
        return NextResponse.json({
          ok: true,
          referenceId: refId,
          submittedAt: payload?.timestamp || new Date().toISOString(),
        });
      }
    } catch {
      // Fallback to local file persistence if backend is offline
    }

    const id = `SSQ-RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const submittedAt = new Date().toISOString();

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      let existing: unknown[] = [];
      try {
        existing = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
      } catch {
        existing = [];
      }
      existing.unshift({
        id,
        submittedAt,
        name,
        company,
        email,
        phone,
        division,
        partName,
        quantity,
        country,
        drawingAvailable,
        message,
      });
      await fs.writeFile(
        DATA_FILE,
        JSON.stringify(existing.slice(0, 200), null, 2),
        "utf-8"
      );
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      ok: true,
      referenceId: id,
      submittedAt,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to process quote request. Please call +91 75300 80040.",
      },
      { status: 500 }
    );
  }
}
