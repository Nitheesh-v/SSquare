"use client";

import { useContext } from "react";
import { AuthStoreContext } from "@/store/auth-store";

export function useAuth() {
  return useContext(AuthStoreContext);
}
