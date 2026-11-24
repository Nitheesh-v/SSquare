"use client";

import React, { createContext, useCallback, useState } from "react";
import { QuotePrefill } from "@/types";

export interface UiStoreValue {
  isQuoteOpen: boolean;
  quotePrefill?: QuotePrefill;
  openQuoteModal: (prefill?: QuotePrefill) => void;
  closeQuoteModal: () => void;
}

export const UiStoreContext = createContext<UiStoreValue>({
  isQuoteOpen: false,
  quotePrefill: undefined,
  openQuoteModal: () => {},
  closeQuoteModal: () => {},
});

export function UiStoreProvider({ children }: { children: React.ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefill, setQuotePrefill] = useState<QuotePrefill | undefined>(
    undefined,
  );

  const openQuoteModal = useCallback((prefill?: QuotePrefill) => {
    setQuotePrefill(prefill);
    setIsQuoteOpen(true);
  }, []);

  const closeQuoteModal = useCallback(() => {
    setIsQuoteOpen(false);
  }, []);

  return (
    <UiStoreContext.Provider
      value={{
        isQuoteOpen,
        quotePrefill,
        openQuoteModal,
        closeQuoteModal,
      }}
    >
      {children}
    </UiStoreContext.Provider>
  );
}
