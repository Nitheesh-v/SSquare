import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create OEM Buyer Account",
};

export default function RegisterPage() {
  return (
    <div className="space-y-5">
      <div>
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-forge-600">
          NEW CLIENT REGISTRATION
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold text-carbon-900">
          Register OEM Buyer Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Create a company procurement account for batch ordering and fast-track custom CAD quotations.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
