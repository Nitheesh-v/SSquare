import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "OEM Production Checkout",
};

export default function CheckoutPage() {
  return (
    <div>
      <section className="bg-carbon-950 text-white bg-blueprint-dark border-b border-carbon-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-400">
            DIRECT FACTORY DISPATCH · FREE 3–4 DAY GLOBAL DHL / FEDEX
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-white">
            OEM Production Order Checkout
          </h1>
        </div>
      </section>

      <section className="py-14 bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CheckoutForm />
        </div>
      </section>
    </div>
  );
}
