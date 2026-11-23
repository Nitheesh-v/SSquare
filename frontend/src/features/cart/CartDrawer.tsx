"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/hooks";
import { formatCurrency } from "@/utils";

export function CartDrawer() {
  const {
    items,
    subtotal,
    isDrawerOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-carbon-950/70 backdrop-blur-xs"
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="Component Order Cart"
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-carbon-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-forge-500" />
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-widest text-forge-400">
                B2B ORDER LIST
              </span>
              <h2 className="font-display text-base font-bold">
                Selected Components ({items.length})
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-xs p-1.5 text-slate-300 hover:bg-carbon-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-display text-base font-bold text-carbon-900">
                Your component cart is empty
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Browse our Rubber, Steel, and Aluminium divisions to add standard or customizable OEM parts.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xs bg-carbon-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-forge-600 transition"
              >
                Explore Products
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xs border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase text-forge-600">
                        {item.sku} · {item.materialBadge}
                      </span>
                      <h4 className="font-display text-sm font-bold text-carbon-900">
                        {item.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                      className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Qty:</span>
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
                        className="w-20 rounded-xs border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-carbon-900"
                      />
                    </div>
                    <div className="text-right">
                      <span className="block font-mono text-xs font-bold text-carbon-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {formatCurrency(item.unitPrice)} / unit est.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Free 3–4 Day Global Door Delivery via DHL / FedEx</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Estimated Subtotal
              </span>
              <span className="font-display text-xl font-bold text-carbon-900">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/cart"
                onClick={closeCart}
                className="inline-flex items-center justify-center rounded-xs border border-slate-300 bg-white py-2.5 text-xs font-semibold text-carbon-900 hover:border-slate-400 transition"
              >
                Review Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="inline-flex items-center justify-center gap-1.5 rounded-xs bg-forge-600 py-2.5 text-xs font-semibold text-white hover:bg-forge-700 transition"
              >
                Checkout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
