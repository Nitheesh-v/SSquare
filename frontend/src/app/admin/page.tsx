"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users as UsersIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks";
import {
  categoriesService,
  ordersService,
  productsService,
  usersService,
} from "@/services";
import {
  BackendProduct,
  Category,
  DivisionSlug,
  Order,
  OrderStatus,
  User,
} from "@/types";
import { formatCurrency, formatDate } from "@/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  const [tab, setTab] = useState<"orders" | "products" | "users">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Tracking number drafts per order
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>(
    {}
  );

  // New Product Quick Form
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newDivision, setNewDivision] = useState<DivisionSlug>("rubber");
  const [newGrade, setNewGrade] = useState("");
  const [newPrice, setNewPrice] = useState("4.50");
  const [creatingProduct, setCreatingProduct] = useState(false);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [ordRes, prodRes, catRes, usrRes] = await Promise.all([
        ordersService.listOrders(),
        productsService.list({ limit: 50 }),
        categoriesService.list(),
        usersService.listAll(),
      ]);
      setOrders(Array.isArray(ordRes) ? ordRes : []);
      setProducts(prodRes?.items || []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setUsers(Array.isArray(usrRes) ? usrRes : []);
    } catch {
      // Handled gracefully
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAdmin) {
        loadAll();
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, loadAll]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const trackingNumber = trackingDrafts[orderId];
    const updated = await ordersService.updateStatus(orderId, {
      status,
      trackingNumber,
    });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newSku || !newGrade) return;
    setCreatingProduct(true);
    try {
      const matchedCat =
        categories.find((c) => c.slug === newDivision) || categories[0];
      const slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      await productsService.create({
        name: newName,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        sku: newSku.toUpperCase(),
        category: matchedCat?._id || "674100000000000000000101",
        division: newDivision,
        materialGrade: newGrade,
        description: `Custom-manufactured ${newName} (${newGrade}) built per client CAD specification.`,
        unitPrice: parseFloat(newPrice) || 1,
        minOrderQty: 25,
        image: `/images/division-${newDivision}.jpg`,
      });
      setNewName("");
      setNewSku("");
      setNewGrade("");
      await loadAll();
    } finally {
      setCreatingProduct(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    await productsService.remove(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }

  if (isLoading) {
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

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="rounded-sm border border-slate-200 bg-white p-8 max-w-md text-center space-y-4">
            <h1 className="font-display text-2xl font-bold text-carbon-900">
              Admin Role Required
            </h1>
            <p className="text-sm text-slate-600">
              Sign in with the S Square Admin account (
              <code className="font-mono text-xs">sales@ssquareengg.com</code> /{" "}
              <code className="font-mono text-xs">Admin@123</code>) to access manufacturing order &amp; catalog controls.
            </p>
            <Link
              href="/account"
              className="inline-block rounded-xs bg-forge-600 px-5 py-2.5 text-xs font-semibold text-white"
            >
              Return to Buyer Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f8f9fb] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="rounded-sm border border-carbon-800 bg-carbon-950 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-forge-400">
                S SQUARE MANUFACTURING OPERATIONS
              </span>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
                <LayoutDashboard className="h-6 w-6 text-forge-500" />
                Admin Control Center
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xs border border-carbon-800 bg-carbon-900 px-4 py-2.5">
                <div className="font-display text-xl font-bold">
                  {orders.length}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  ORDERS / RFQS
                </div>
              </div>
              <div className="rounded-xs border border-carbon-800 bg-carbon-900 px-4 py-2.5">
                <div className="font-display text-xl font-bold">
                  {products.length}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  API PRODUCTS
                </div>
              </div>
              <div className="rounded-xs border border-carbon-800 bg-carbon-900 px-4 py-2.5">
                <div className="font-display text-xl font-bold">
                  {users.length}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  ACCOUNTS
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "orders", label: "Orders & RFQs", icon: Package },
                { id: "products", label: "Backend Products", icon: Boxes },
                { id: "users", label: "Registered Users", icon: UsersIcon },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    tab === t.id
                      ? "bg-carbon-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:text-carbon-900"
                  }`}
                >
                  <Icon className="h-4 w-4 text-forge-500" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {loadingData ? (
            <div className="py-16 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-forge-600 mx-auto" />
            </div>
          ) : tab === "orders" ? (
            <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-carbon-900">
                All Incoming Orders &amp; Custom RFQs
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No orders or RFQs submitted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="rounded-xs border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-carbon-900">
                            {ord.orderNumber}
                          </span>
                          <Badge tone="forge">{ord.status}</Badge>
                          <Badge tone="slate">{ord.orderType}</Badge>
                        </div>
                        <span className="font-mono text-xs text-slate-500">
                          {formatDate(ord.createdAt)} ·{" "}
                          {ord.shippingAddress?.contactName} (
                          {ord.shippingAddress?.country})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        {ord.items.map((it, idx) => (
                          <div key={idx}>
                            • <strong>{it.name}</strong> × {it.quantity}{" "}
                            {it.customSpecs ? `(${it.customSpecs})` : ""}
                          </div>
                        ))}
                        {ord.notes && (
                          <p className="mt-1.5 text-slate-500 italic">
                            Note: {ord.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          placeholder="DHL / FedEx Tracking #"
                          defaultValue={ord.trackingNumber || ""}
                          onChange={(e) =>
                            setTrackingDrafts((prev) => ({
                              ...prev,
                              [ord._id]: e.target.value,
                            }))
                          }
                          className="rounded-xs border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-carbon-900"
                        />

                        {(
                          [
                            "pending",
                            "confirmed",
                            "in_production",
                            "shipped",
                            "delivered",
                          ] as OrderStatus[]
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(ord._id, st)}
                            className={`rounded-xs px-2.5 py-1 text-[11px] font-mono uppercase transition cursor-pointer ${
                              ord.status === st
                                ? "bg-forge-600 text-white font-bold"
                                : "border border-slate-300 bg-white text-slate-700 hover:border-forge-500"
                            }`}
                          >
                            {st.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "products" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form
                onSubmit={handleCreateProduct}
                className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-6 space-y-3.5"
              >
                <h3 className="font-display text-base font-bold text-carbon-900 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-forge-600" />
                  Add Catalog SKU
                </h3>
                <Input
                  label="Component Name"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. EPDM Flange Seal"
                />
                <Input
                  label="SKU Code"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="SSQ-RB-EPD09"
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Division
                  </label>
                  <select
                    value={newDivision}
                    onChange={(e) =>
                      setNewDivision(e.target.value as DivisionSlug)
                    }
                    className="w-full rounded-xs border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="rubber">Rubber Products</option>
                    <option value="steel">Steel Products</option>
                    <option value="aluminium">Aluminium Products</option>
                  </select>
                </div>
                <Input
                  label="Material / Alloy Grade"
                  required
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  placeholder="EPDM 70 Shore A"
                />
                <Input
                  label="Unit Ref Price (USD)"
                  type="number"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={creatingProduct}
                  className="w-full"
                >
                  {creatingProduct ? "Saving..." : "Create Product in API"}
                </Button>
              </form>

              <div className="lg:col-span-8 rounded-sm border border-slate-200 bg-white p-6 space-y-3">
                <h3 className="font-display text-base font-bold text-carbon-900">
                  Live NestJS Catalog SKUs ({products.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <div
                      key={p._id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-mono text-[11px] text-forge-600 font-semibold">
                          {p.sku} · {p.division.toUpperCase()}
                        </span>
                        <div className="font-display text-sm font-bold text-carbon-900">
                          {p.name}
                        </div>
                        <div className="text-slate-500">{p.materialGrade}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-carbon-900">
                          {formatCurrency(p.unitPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p._id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-slate-200 bg-white p-6">
              <h2 className="font-display text-lg font-bold text-carbon-900 mb-4">
                Registered Portal Accounts ({users.length})
              </h2>
              <div className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-carbon-900">{u.name}</div>
                      <div className="text-xs text-slate-500">
                        {u.email} {u.company ? `· ${u.company}` : ""}
                      </div>
                    </div>
                    <Badge tone={u.role === "admin" ? "forge" : "slate"}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
