"use client";

import React from "react";
import { UiStoreProvider } from "./ui-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <UiStoreProvider>{children}</UiStoreProvider>;
}
