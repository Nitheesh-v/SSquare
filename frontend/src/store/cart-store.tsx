"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ProductCartLine } from "@/types";
import { storage } from "@/utils/storage";

export interface CartStoreValue {
  items: ProductCartLine[];
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<ProductCartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSpecs: (id: string, customSpecs: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const CartStoreContext = createContext<CartStoreValue>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  isDrawerOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addItem: () => {},
  updateQuantity: () => {},
  updateSpecs: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

export function CartStoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductCartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = storage.getJSON<ProductCartLine[]>(storage.keys.CART_KEY, []);
    setItems(Array.isArray(saved) ? saved : []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      storage.setJSON(storage.keys.CART_KEY, items);
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (incoming: Omit<ProductCartLine, "quantity"> & { quantity?: number }) => {
      const qtyToAdd = incoming.quantity ?? incoming.minOrderQty ?? 1;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === incoming.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + qtyToAdd,
            customSpecs: incoming.customSpecs ?? next[idx].customSpecs,
          };
          return next;
        }
        return [
          ...prev,
          {
            ...incoming,
            quantity: qtyToAdd,
          },
        ];
      });
      setIsDrawerOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const updateSpecs = useCallback((id: string, customSpecs: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, customSpecs } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() => items.length, [items]);
  const subtotal = useMemo(
    () =>
      Math.round(
        items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100
      ) / 100,
    [items]
  );

  return (
    <CartStoreContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isDrawerOpen,
        openCart: () => setIsDrawerOpen(true),
        closeCart: () => setIsDrawerOpen(false),
        addItem,
        updateQuantity,
        updateSpecs,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartStoreContext.Provider>
  );
}
