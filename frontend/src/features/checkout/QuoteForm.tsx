"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { QuotePrefill } from "@/types";

interface QuoteFormProps {
  prefill?: QuotePrefill;
  compact?: boolean;
}

export function QuoteForm({ prefill, compact = false }: QuoteFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState(
    prefill?.division || "Rubber Products"
  );
  const [partName, setPartName] = useState(prefill?.partName || "");
  const [quantity, setQuantity] = useState("");
  const [country, setCountry] = useState("India");
  const [drawingAvailable, setDrawingAvailable] = useState(
    "Yes – CAD / PDF Drawing Ready"
  );
  const [message, setMessage] = useState(prefill?.message || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    referenceId: string;
    submittedAt: string;
  } | null>(null);

  useEffect(() => {
    if (prefill?.division) setDivision(prefill.division);
    if (prefill?.partName !== undefined) setPartName(prefill.partName);
    if (prefill?.message) setMessage(prefill.message);
  }, [prefill?.division, prefill?.partName, prefill?.message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/quote", {
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

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Please check your details and try again.");
      } else {
        setResult({
          referenceId: data.referenceId,
          submittedAt: data.submittedAt,
        });
      }
    } catch {
      setError(
        "Network error while submitting RFQ. You can also reach us directly at +91 75300 80040."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const mailSubject = encodeURIComponent(
      `[${result.referenceId}] Custom Quote Inquiry – ${partName || division}`
    );
    const mailBody = encodeURIComponent(
      `RFQ Reference: ${result.referenceId}\nName: ${name}\nCompany: ${company || "N/A"}\nPhone: ${phone}\nDivision: ${division}\nPart / Material: ${partName || "Custom Spec"}\nQuantity: ${quantity || "TBD"}\nDestination: ${country}\nDrawing / Sample: ${drawingAvailable}\n\nSpecifications:\n${message}`
    );
    const waText = encodeURIComponent(
      `Hello S Square Engineering, I just submitted RFQ *${result.referenceId}* for *${partName || division}* (${quantity || "Custom Qty"}). Name: ${name}, Email: ${email}.`
    );

    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-6 text-carbon-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="inline-block font-mono text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-xs mb-2">
              RFQ Logged · Ref #{result.referenceId}
            </span>
            <h3 className="font-display text-xl font-bold text-carbon-900">
              Engineering Inquiry Received
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Thank you, <strong className="text-carbon-900">{name}</strong>. Our engineering estimation desk in Coimbatore reviews custom specifications Monday–Saturday and responds within 24 hours.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`mailto:${COMPANY_INFO.emails.sales}?subject=${mailSubject}&body=${mailBody}`}
                className="inline-flex items-center gap-2 rounded-xs bg-carbon-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-carbon-800 transition"
              >
                <Mail className="h-3.5 w-3.5 text-forge-500" />
                Attach Drawings via Email
              </a>
              <a
                href={`https://wa.me/917530080040?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xs border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-carbon-900 hover:border-forge-500 transition"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                Fast-Track on WhatsApp
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setMessage("");
                setPartName("");
              }}
              className="mt-4 text-xs font-medium text-slate-500 underline hover:text-carbon-900"
            >
              Submit another part specification
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-xs border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-carbon-900 placeholder:text-slate-400 focus:border-forge-600 focus:outline-none focus:ring-2 focus:ring-forge-600/15 transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xs border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Your Name <span className="text-forge-600">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Company / OEM Name
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Apex Hydraulics Pvt Ltd"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Work Email <span className="text-forge-600">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Phone / WhatsApp <span className="text-forge-600">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Product Division
          </label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className={inputClasses}
          >
            <option value="Rubber Products">
              Rubber Products (Seals, Gaskets, Bonded)
            </option>
            <option value="Steel Products">
              Steel Products (Stainless, CNC, Fabricated)
            </option>
            <option value="Aluminium Products">
              Aluminium Products (Die Molds, 6061 CNC)
            </option>
            <option value="Multi-Material OEM Assembly">
              Multi-Material Assembly (Rubber + Metal)
            </option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Part / Material Grade
          </label>
          <input
            type="text"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="e.g. Metal-to-Viton Bonded Seal / 6061 Die Mold"
            className={inputClasses}
          />
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Est. Quantity
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 500 pcs / month"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Delivery Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India, USA, Germany, UAE"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Drawing / Sample
            </label>
            <select
              value={drawingAvailable}
              onChange={(e) => setDrawingAvailable(e.target.value)}
              className={inputClasses}
            >
              <option value="Yes – CAD / PDF Drawing Ready">
                CAD / PDF Drawing Ready
              </option>
              <option value="Physical Sample Available">
                Physical Sample Ready
              </option>
              <option value="Need Design / Compound Guidance">
                Need Engineering Guidance
              </option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Technical Requirements &amp; Dimensions{" "}
          <span className="text-forge-600">*</span>
        </label>
        <textarea
          rows={compact ? 3 : 4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe dimensions, operating temperature/media, Shore A hardness or alloy grade, tolerances, and target delivery timeline..."
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-slate-500">
          <span className="font-semibold text-carbon-800">
            Free Global Door Delivery
          </span>{" "}
          in 3–4 days via DHL / FedEx.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xs bg-forge-600 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-forge-700 disabled:opacity-60 transition cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting RFQ...
            </>
          ) : (
            <>
              Request Custom Quote
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
