"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Package,
  Building2,
  Mail,
  Phone,
  LayoutDashboard,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks";
import { ordersService } from "@/services";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingOrders(true);
      ordersService
        .listOrders()
        .then((res) => setOrders(Array.isArray(res) ? res : []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="h-7 w-7 animate-spin text-forge-600" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f8f9fb] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="forge">{user.role}</Badge>
                <span className="font-mono text-xs text-slate-400">
                  ACCOUNT PORTAL
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-carbon-900">
                Welcome, {user.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                {user.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-forge-600" />
                    {user.company}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-forge-600" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-forge-600" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-xs bg-carbon-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-carbon-800 transition"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-forge-500" />
                  Open Admin Console
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="inline-flex items-center gap-1.5 rounded-xs border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-carbon-900 hover:border-red-500 hover:text-red-600 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Order History */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Package className="h-5 w-5 text-forge-600" />
                <h2 className="font-display text-xl font-bold text-carbon-900">
                  Production Orders &amp; Custom RFQs ({orders.length})
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs font-semibold text-forge-600 hover:underline"
              >
                New Component Order
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-forge-600 mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  No production orders placed under this account yet.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-xs bg-forge-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-forge-700"
                >
                  Browse Rubber, Steel &amp; Aluminium Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="rounded-xs border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-carbon-900">
                          {ord.orderNumber}
                        </span>
                        <Badge
                          tone={
                            ord.status === "delivered" || ord.status === "shipped"
                              ? "emerald"
                              : ord.status === "in_production" ||
                                ord.status === "confirmed"
                              ? "forge"
                              : "slate"
                          }
                        >
                          {ord.status.replace("_", " ")}
                        </Badge>
                        <Badge tone="slate">
                          {ord.orderType === "custom_rfq"
                            ? "Custom RFQ"
                            : "Standard Order"}
                        </Badge>
                      </div>
                      <span className="font-mono text-xs text-slate-500">
                        {formatDate(ord.createdAt)}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/70 text-xs">
                      {ord.items.map((line, idx) => (
                        <div
                          key={idx}
                          className="py-2 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="font-semibold text-carbon-900">
                              {line.name}
                            </span>
                            {line.customSpecs && (
                              <span className="block text-slate-500">
                                {line.customSpecs}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-slate-700 shrink-0">
                            Qty: {line.quantity}
                            {line.unitPrice > 0 &&
                              ` · ${formatCurrency(
                                line.unitPrice * line.quantity
                              )}`}
                          </div>
                        </div>
                      ))}
                    </div>

                    {ord.trackingNumber && (
                      <div className="flex items-center gap-2 rounded-xs bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                        <Truck className="h-4 w-4 shrink-0" />
                        <span>
                          Express DHL / FedEx Waybill:{" "}
                          <strong className="font-mono">
                            {ord.trackingNumber}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
