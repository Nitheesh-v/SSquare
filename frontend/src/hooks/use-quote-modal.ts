"use client";

import { useContext } from "react";
import { UiStoreContext } from "@/store/ui-store";

export function useQuoteModal() {
  return useContext(UiStoreContext);
}
