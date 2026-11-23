"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight, Lock } from "lucide-react";
import { useAuth, useCart } from "@/hooks";
import { ordersService } from "@/services";
import { formatCurrency } from "@/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types";

export function CheckoutForm() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [drawingAvailable, setDrawingAvailable] = useState(
    "Yes – CAD / PDF Drawing Ready"
  );
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setContactName(user.name || "");
      setCompany(user.company || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (completedOrder) {
    return (
      <div className="rounded-sm border border-emerald-200 bg-white p-8 sm:p-10 shadow-xs space-y-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700">
              ORDER CONFIRMED · #{completedOrder.orderNumber}
            </span>
            <h2 className="font-display text-2xl font-bold text-carbon-900">
              Production Order Logged Successfully
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Your order <strong>{completedOrder.orderNumber}</strong> has been transmitted to our Coimbatore engineering &amp; dispatch desk. Free 3–4 day global DHL / FedEx air delivery is included.
        </p>

        <div className="rounded-xs border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Order Reference:</span>
            <span className="font-mono font-bold text-carbon-900">
              {completedOrder.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Total:</span>
            <span className="font-mono font-bold text-carbon-900">
              {formatCurrency(completedOrder.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping Method:</span>
            <span className="font-semibold text-emerald-700">
              {completedOrder.shippingMethod}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-xs bg-carbon-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-carbon-800 transition"
          >
            Track Order in Account Portal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xs border border-slate-300 px-5 py-2.5 text-xs font-semibold text-carbon-900 hover:border-forge-600 transition"
          >
            Continue Browsing Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-slate-200 bg-white p-12 text-center space-y-4">
        <h2 className="font-display text-xl font-bold text-carbon-900">
          No Components Selected for Checkout
        </h2>
        <p className="text-sm text-slate-500">
          Add items from the product catalog before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xs bg-forge-600 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Go to Product Catalog
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-sm border border-slate-200 bg-white p-8 max-w-xl mx-auto text-center space-y-4">
        <Lock className="h-8 w-8 text-forge-600 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-carbon-900">
          Sign In to Place Your OEM Production Order
        </h2>
        <p className="text-sm text-slate-600">
          Sign in or register an OEM Buyer account to submit cart orders, track production status, and view DHL/FedEx tracking numbers. (Your {items.length} cart item{items.length > 1 ? "s" : ""} will stay saved!)
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-xs bg-forge-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-forge-700"
          >
            Sign In (Demo Ready)
          </Link>
          <Link
            href="/register"
            className="rounded-xs border border-slate-300 px-6 py-2.5 text-sm font-semibold text-carbon-900 hover:border-forge-600"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await ordersService.createOrder({
        shippingAddress: {
          contactName,
          company,
          email,
          phone,
          addressLine,
          city,
          country,
        },
        items: items.map((i) => ({
          productId: i.backendProductId,
          name: i.name,
          quantity: i.quantity,
          customSpecs: i.customSpecs || `${i.sku} · ${i.materialBadge}`,
        })),
        drawingAvailable,
        notes,
      });
      clearCart();
      setCompletedOrder(order);
    } catch (err: any) {
      setError(err?.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      <div className="lg:col-span-7 rounded-sm border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
        <h2 className="font-display text-xl font-bold text-carbon-900 border-b border-slate-100 pb-3">
          Shipping &amp; Technical Dispatch Details
        </h2>

        {error && (
          <div className="rounded-xs border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Contact Person"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <Input
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Phone / WhatsApp"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input
          label="Facility / Plant Street Address"
          required
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Plot / Industrial Park / Street"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="City / State"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Destination Country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            CAD Drawing / Sample Status
          </label>
          <select
            value={drawingAvailable}
            onChange={(e) => setDrawingAvailable(e.target.value)}
            className="w-full rounded-xs border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-carbon-900"
          >
            <option value="Yes – CAD / PDF Drawing Ready">
              CAD / PDF Drawing Ready
            </option>
            <option value="Standard Catalog Dimensions">
              Standard Catalog Specification
            </option>
            <option value="Sending Physical Sample">
              Sending Physical Reference Sample
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            PO Reference / Inspection Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional PO number, test certificate requests, or special instructions..."
            className="w-full rounded-xs border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-carbon-900"
          />
        </div>
      </div>

      <aside className="lg:col-span-5 rounded-sm border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
        <h3 className="font-display text-lg font-bold text-carbon-900 border-b border-slate-100 pb-3">
          Order Review ({items.length} items)
        </h3>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {items.map((i) => (
            <div key={i.id} className="py-2.5 flex justify-between gap-3 text-xs">
              <div>
                <div className="font-semibold text-carbon-900">{i.name}</div>
                <div className="text-slate-500">
                  Qty: {i.quantity} · {i.materialBadge}
                </div>
              </div>
              <div className="font-mono font-semibold text-carbon-900 shrink-0">
                {formatCurrency(i.unitPrice * i.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>DHL / FedEx Global Door Delivery</span>
            <span className="font-mono font-semibold text-emerald-700">FREE</span>
          </div>
          <div className="flex justify-between font-display text-lg font-bold text-carbon-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full py-3">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Order...
            </>
          ) : (
            <>
              Confirm OEM Production Order
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </aside>
    </form>
  );
}
