import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In – OEM Buyer & Admin Portal",
};

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <div>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
          OEM PROCUREMENT PORTAL
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold text-carbon-900">
          Sign In to S Square
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Access your component orders, custom RFQ history, and DHL/FedEx shipment tracking.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
