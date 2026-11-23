"use client";

import React from "react";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/hooks";
import { formatCurrency } from "@/utils";

export function CartSummaryView() {
  const { items, subtotal, updateQuantity, updateSpecs, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-slate-200 bg-white p-14 text-center space-y-4">
        <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-carbon-900">
          Your Component Order Cart Is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Add custom-molded rubber seals, stainless steel CNC parts, or aluminium die molds from our catalog to build a batch order.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xs bg-forge-600 px-6 py-3 text-sm font-semibold text-white hover:bg-forge-700 transition"
        >
          Browse Product Catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-20 rounded-xs object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="font-mono text-[11px] font-semibold text-forge-600">
                    {item.sku} · {item.materialBadge}
                  </span>
                  <h3 className="font-display text-base font-bold text-carbon-900">
                    {item.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Unit Ref Price: {formatCurrency(item.unitPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.id,
                        Math.max(1, parseInt(e.target.value || "1", 10))
                      )
                    }
                    className="w-24 rounded-xs border border-slate-300 px-2.5 py-1.5 font-mono text-xs text-carbon-900"
                  />
                </div>

                <div className="text-right min-w-24">
                  <div className="font-display text-base font-bold text-carbon-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom Dimensions / Durometer / Tolerance Notes (Optional)
              </label>
              <input
                type="text"
                value={item.customSpecs || ""}
                onChange={(e) => updateSpecs(item.id, e.target.value)}
                placeholder="e.g. ID 24mm × OD 38mm · 75 Shore A · Per CAD rev B"
                className="w-full rounded-xs border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-carbon-900 focus:border-forge-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
        >
          Clear All Items
        </button>
      </div>

      {/* Summary Panel */}
      <aside className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-display text-lg font-bold text-carbon-900 border-b border-slate-100 pb-3">
          Order Summary
        </h3>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Line Items</span>
            <span className="font-mono font-semibold text-carbon-900">
              {items.length}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Global DHL / FedEx Air</span>
            <span className="font-mono font-semibold text-emerald-700">
              FREE (3–4 Days)
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 font-display text-lg font-bold text-carbon-900">
            <span>Estimated Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <div className="rounded-xs bg-slate-50 border border-slate-200 p-3 flex items-start gap-2 text-xs text-slate-600">
          <Truck className="h-4 w-4 text-forge-600 shrink-0 mt-0.5" />
          <span>
            Includes 100% dimensional conformity inspection and export-grade packaging from Coimbatore.
          </span>
        </div>

        <Link
          href="/checkout"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xs bg-forge-600 px-5 py-3 text-sm font-semibold text-white hover:bg-forge-700 transition"
        >
          Proceed to OEM Checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    </div>
  );
}
