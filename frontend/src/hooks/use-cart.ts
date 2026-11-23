"use client";

import { useContext } from "react";
import { CartStoreContext } from "@/store/cart-store";

export function useCart() {
  return useContext(CartStoreContext);
}
