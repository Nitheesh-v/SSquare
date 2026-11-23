"use client";

import React from "react";
import { AuthStoreProvider } from "./auth-store";
import { CartStoreProvider } from "./cart-store";
import { UiStoreProvider } from "./ui-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthStoreProvider>
      <CartStoreProvider>
        <UiStoreProvider>{children}</UiStoreProvider>
      </CartStoreProvider>
    </AuthStoreProvider>
  );
}
