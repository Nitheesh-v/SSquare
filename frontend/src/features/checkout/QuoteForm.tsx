"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-data";
import { type QuotePrefill } from "@/types";

type QuoteResult = {
  referenceId: string;
  submittedAt: string;
  savedToBackend: boolean;
  savedLocally: boolean;
  emailDispatched: boolean;
  webhookDispatched: boolean;
};
const initialInterest = (prefill?: QuotePrefill) =>
  [prefill?.division, prefill?.partName].filter(Boolean).join(" — ");
const inputClasses =
  "min-h-11 w-full border border-slate-300 bg-white px-3.5 py-3 text-xs text-carbon-900 placeholder:text-slate-500 focus:border-forge-600 disabled:bg-slate-50";
const labelClasses = "mb-2 block text-[11px] font-semibold text-slate-700";

export function QuoteForm({
  prefill,
  compact = false,
}: {
  prefill?: QuotePrefill;
  compact?: boolean;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(initialInterest(prefill));
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState(prefill?.message || "");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<QuoteResult | null>(null);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefill?.division || prefill?.partName)
      setInterest(initialInterest(prefill));
    if (prefill?.message) setMessage(prefill.message);
  }, [prefill?.division, prefill?.partName, prefill?.message]);
  useEffect(() => {
    if (result || error) feedback.current?.focus({ preventScroll: true });
  }, [result, error]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          division: interest,
          partName: prefill?.partName || "",
          quantity,
          message,
          website,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok)
        setError(data.error || "Please check your enquiry and try again.");
      else setResult(data);
    } catch {
      setError(
        "We couldn’t confirm your submission. Your details are still here. Please try again or send the enquiry directly by phone, WhatsApp or email.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const draft = [
    result
      ? `Enquiry reference: ${result.referenceId}`
      : "Custom component enquiry",
    `Name: ${name}`,
    `Company: ${company || "To discuss"}`,
    `Email: ${email || "Not provided"}`,
    `Phone / WhatsApp: ${phone || "Not provided"}`,
    `Material / product: ${interest || "To discuss"}`,
    `Quantity: ${quantity || "To discuss"}`,
    "",
    message,
  ].join("\n");
  const emailLink = `mailto:${COMPANY_INFO.emails.sales}?subject=${encodeURIComponent(`Quote request${result ? ` [${result.referenceId}]` : ""} – ${interest || "Custom components"}`)}&body=${encodeURIComponent(draft)}`;
  const whatsappLink = `https://wa.me/917530080040?text=${encodeURIComponent(`Hello S Square Engineering Services,\n${draft}`)}`;

  if (result) {
    const delivered = result.emailDispatched || result.webhookDispatched;
    return (
      <div
        ref={feedback}
        tabIndex={-1}
        role="status"
        className="space-y-5 border border-slate-200 bg-slate-50 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          {delivered ? (
            <CheckCircle2
              size={23}
              className="mt-1 shrink-0 text-emerald-700"
            />
          ) : (
            <Info size={23} className="mt-1 shrink-0 text-forge-700" />
          )}
          <div>
            <p className="font-mono text-[10px] text-slate-600">
              REFERENCE / {result.referenceId}
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold">
              {delivered
                ? "Your enquiry has been sent."
                : "Saved. Now send it to our team."}
            </h3>
          </div>
        </div>
        <p className="text-xs leading-[1.9] text-slate-600">
          {result.emailDispatched
            ? "Your enquiry was accepted by the email service for delivery to S Square. Keep this reference for your follow-up. CAD drawings can be sent separately using the email or WhatsApp links below."
            : result.webhookDispatched
              ? "Your enquiry was accepted by the connected sales system. Keep this reference for your follow-up. Use email or WhatsApp below to share drawings or additional information."
              : `${result.savedToBackend ? "Your enquiry is saved in this application’s RFQ store." : "Your enquiry is saved on this application instance."} It has NOT been automatically emailed or delivered to S Square. Automatic delivery is not configured or did not complete. Please use a pre-filled option below to send it directly.`}
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-between gap-3 bg-[#166534] px-4 py-3 text-xs font-semibold text-white hover:bg-[#14532d]"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquare size={16} />
              Send via WhatsApp
            </span>
            <ArrowUpRight size={14} />
          </a>
          <a
            href={emailLink}
            className="button-secondary min-w-0 justify-between"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <Mail size={16} className="shrink-0" />
              <span className="min-w-0 break-words">
                Email {COMPANY_INFO.emails.sales}
              </span>
            </span>
            <ArrowUpRight size={14} className="shrink-0" />
          </a>
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 text-xs font-semibold hover:text-forge-700"
          >
            <Phone size={15} />
            {COMPANY_INFO.phone}
          </a>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          These links open your own email or WhatsApp application. Review and
          send the message there. Attach drawings separately.
        </p>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setMessage("");
          }}
          className="min-h-11 text-xs font-medium underline underline-offset-4 hover:text-forge-700"
        >
          Prepare another enquiry
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div
          ref={feedback}
          tabIndex={-1}
          role="alert"
          className="border border-red-200 bg-red-50 p-4 text-xs leading-relaxed text-red-800"
        >
          {error}
          <div className="mt-3 flex flex-wrap gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Send by WhatsApp
            </a>
            <a href={emailLink} className="font-semibold underline">
              Send by email
            </a>
          </div>
        </div>
      )}
      <fieldset disabled={submitting} className="space-y-4">
        <legend className="sr-only">
          Your contact details and component requirements
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor={`${id}-name`}>
              Full name <span className="text-forge-700">*</span>
            </label>
            <input
              className={inputClasses}
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              minLength={2}
              maxLength={120}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor={`${id}-company`}>
              Company name
            </label>
            <input
              className={inputClasses}
              id={`${id}-company`}
              name="company"
              autoComplete="organization"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={160}
              placeholder="Organization or OEM"
            />
          </div>
        </div>
        <div>
          <p
            id={`${id}-contact-hint`}
            className="mb-3 text-[10px] text-slate-600"
          >
            Please provide at least one contact method: email or phone /
            WhatsApp.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses} htmlFor={`${id}-email`}>
                Work email
              </label>
              <input
                className={inputClasses}
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby={`${id}-contact-hint`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required={!phone.trim()}
                maxLength={254}
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor={`${id}-phone`}>
                Phone / WhatsApp
              </label>
              <input
                className={inputClasses}
                id={`${id}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                aria-describedby={`${id}-contact-hint`}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required={!email.trim()}
                maxLength={40}
                placeholder="Include country code"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor={`${id}-interest`}>
              Material / product interest
            </label>
            <input
              className={inputClasses}
              id={`${id}-interest`}
              name="interest"
              list={`${id}-materials`}
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              maxLength={240}
              placeholder="Select or describe your component"
            />
            <datalist id={`${id}-materials`}>
              <option value="Rubber Products" />
              <option value="Steel Products" />
              <option value="Aluminium Products" />
              <option value="Rubber-to-Metal Bonded Seals" />
              <option value="Aluminium Die Molds" />
              <option value="Multi-Material Components" />
            </datalist>
          </div>
          <div>
            <label className={labelClasses} htmlFor={`${id}-quantity`}>
              Estimated quantity
            </label>
            <input
              className={inputClasses}
              id={`${id}-quantity`}
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              maxLength={100}
              placeholder="e.g. 500 pieces"
            />
          </div>
        </div>
        <div>
          <label className={labelClasses} htmlFor={`${id}-message`}>
            Requirements / drawing notes{" "}
            <span className="text-forge-700">*</span>
          </label>
          <textarea
            className={inputClasses}
            id={`${id}-message`}
            name="message"
            rows={compact ? 3 : 4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            minLength={10}
            maxLength={6000}
            placeholder="Material, dimensions, finish, application, or whether you have a drawing / sample…"
          />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            No file upload here. Send drawings separately to{" "}
            {COMPANY_INFO.emails.sales} or by WhatsApp.
          </p>
        </div>
        <div hidden aria-hidden="true">
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
      </fieldset>
      <div className="border-t border-slate-200 pt-5">
        <p className="mb-4 text-[10px] leading-relaxed text-slate-600">
          We’ll show whether automatic delivery completed. If it’s unavailable,
          use the pre-filled email or WhatsApp link on the next step. By
          submitting, you allow us to contact you about this enquiry.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="button-primary w-full justify-center disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting enquiry…
            </>
          ) : (
            <>
              Request a Quote
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
