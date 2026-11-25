"use client";

import {
  ArrowUpRight,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  X,
} from "lucide-react";
import { QuoteForm } from "@/features/checkout/QuoteForm";
import { COMPANY_INFO } from "@/lib/company-data";
import { ReferenceIllustration } from "./ReferenceIllustration";
import { REFERENCE_MATERIALS } from "./reference-data";

type Props = {
  pack: (number | null)[];
  labels: (string | null)[];
  preparing: boolean;
  onAdd: (index: number, source?: HTMLElement | null) => void;
  onRemove: (slot: number) => void;
  onPrepare: () => void;
};

export function ReferenceQuote({
  pack,
  labels,
  preparing,
  onAdd,
  onRemove,
  onPrepare,
}: Props) {
  const count = pack.filter((x) => x !== null).length;
  const selectedItems = pack.flatMap((index, i) =>
    index === null ? [] : [labels[i] || REFERENCE_MATERIALS[index].division],
  );
  return (
    <section
      id="quote"
      className="journey-builder reference-quote"
      aria-labelledby="reference-quote-heading"
    >
      <div className="reference-quote-layout ref-shell">
        <div className="reference-quote-left">
          <div className="reference-quote-intro journey-reveal-content">
            <p className="ref-kicker">
              <span>05</span> / LET’S MAKE IT PRECISE
            </p>
            <h2 id="reference-quote-heading" className="j-display">
              The next component
              <br />
              starts with a<br />
              <em>conversation.</em>
            </h2>
            <p>
              Tell us what you need to make. Share a material, a quantity and
              the details that matter. Drawings and samples can be coordinated
              directly by email or WhatsApp.
            </p>
            <div className="reference-contact-links">
              <a href={`tel:${COMPANY_INFO.phoneRaw}`}>
                <Phone size={17} />
                {COMPANY_INFO.phone}
                <ArrowUpRight size={15} />
              </a>
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare size={17} />
                Message on WhatsApp
                <ArrowUpRight size={15} />
              </a>
              <a href={`mailto:${COMPANY_INFO.emails.sales}`}>
                <Mail size={17} />
                {COMPANY_INFO.emails.sales}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
          <div className="reference-pack" aria-labelledby="pack-heading">
            <p className="ref-kicker">
              YOUR ENQUIRY PACK{" "}
              <span>{count.toString().padStart(2, "0")} / 03</span>
            </p>
            <h3 id="pack-heading">
              Pick up to 3 materials for one combined quote.
            </h3>
            <div className="reference-pack-slots brief-arrangement">
              <div className="brief-glow" aria-hidden="true" />
              {pack.map((index, i) => (
                <div
                  key={i}
                  className={`brief-slot brief-slot-${i} ${index !== null ? "filled" : ""}`}
                >
                  <span className="brief-slot-number">0{i + 1}</span>
                  {index !== null ? (
                    <div
                      key={`${index}-${labels[i]}`}
                      className="brief-slot-part"
                    >
                      <ReferenceIllustration type={index} />
                      <span
                        title={labels[i] || REFERENCE_MATERIALS[index].name}
                      >
                        {labels[i] || REFERENCE_MATERIALS[index].name}
                      </span>
                    </div>
                  ) : (
                    <Plus
                      size={23}
                      className="reference-empty-plus"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    aria-label={
                      index === null
                        ? `Empty brief position ${i + 1}`
                        : `Remove ${REFERENCE_MATERIALS[index].name} from position ${i + 1}`
                    }
                    disabled={index === null || preparing}
                    onClick={() => onRemove(i)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="brief-thumbnails"
              role="group"
              aria-label="Add materials to your brief"
            >
              {REFERENCE_MATERIALS.map((m, i) => {
                const n = pack.filter((x) => x === i).length;
                return (
                  <button
                    type="button"
                    key={m.slug}
                    disabled={preparing}
                    aria-label={`Add ${m.name} to brief`}
                    onClick={(event) =>
                      onAdd(
                        i,
                        event.currentTarget.querySelector<HTMLElement>(
                          ".brief-thumb-image",
                        ),
                      )
                    }
                  >
                    <span
                      className="brief-thumb-image"
                      style={{ background: m.color }}
                    >
                      <ReferenceIllustration type={i} />
                      <span className="thumb-count">
                        {n === 1 ? (
                          <Check size={12} />
                        ) : n > 1 ? (
                          n
                        ) : (
                          <Plus size={12} />
                        )}
                      </span>
                    </span>
                    <strong>{m.name}</strong>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              id="brief-buy"
              className="brief-buy"
              disabled={count === 0 || preparing}
              aria-busy={preparing}
              onClick={onPrepare}
            >
              {preparing
                ? "Preparing your enquiry…"
                : count === 0
                  ? "Pick a material"
                  : "Use this enquiry pack"}
              <span>{count === 0 ? "0 / 3" : <ArrowUpRight size={18} />}</span>
            </button>
            <p className="brief-disclaimer">
              Suggested materials are editable. Nothing is sent until you submit
              the form. No cart or online payment. You can also complete the
              form without a pack.
            </p>
          </div>
        </div>
        <div className="reference-quote-form" data-testid="inline-quote">
          <p className="ref-kicker">YOUR PROJECT / OUR STARTING POINT</p>
          <h3 className="j-display" tabIndex={-1}>
            Request a Quote
          </h3>
          <p className="reference-form-intro">
            Tell us about your component or enquiry. Share the details to start
            a technical discussion.
          </p>
          <QuoteForm selectedItems={selectedItems} />
        </div>
      </div>
    </section>
  );
}
