"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Demo Credentials Helper */}
      <div className="rounded-xs border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          <KeyRound className="h-3.5 w-3.5 text-forge-600" />
          Quick Demo Accounts
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("buyer@example.com");
              setPassword("Buyer@123");
            }}
            className="rounded-xs border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-carbon-900 hover:border-forge-600 cursor-pointer"
          >
            Fill OEM Buyer
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("sales@ssquareengg.com");
              setPassword("Admin@123");
            }}
            className="rounded-xs border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-carbon-900 hover:border-forge-600 cursor-pointer"
          >
            Fill Admin Console
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xs border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Work Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In to Portal
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-600">
        New OEM buyer or procurement partner?{" "}
        <Link
          href="/register"
          className="font-semibold text-forge-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
