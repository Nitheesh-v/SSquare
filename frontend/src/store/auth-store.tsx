"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { LoginPayload, RegisterPayload, User } from "@/types";
import { authService } from "@/services/auth.service";
import { storage } from "@/utils/storage";

export interface AuthStoreValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthStoreContext = createContext<AuthStoreValue>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {
    throw new Error("AuthStoreProvider not mounted");
  },
  register: async () => {
    throw new Error("AuthStoreProvider not mounted");
  },
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
      storage.setJSON(storage.keys.USER_KEY, me);
    } catch {
      storage.clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = storage.getJSON<User | null>(storage.keys.USER_KEY, null);
    if (cached) setUser(cached);
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    storage.setToken(res.accessToken);
    storage.setJSON(storage.keys.USER_KEY, res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    storage.setToken(res.accessToken);
    storage.setJSON(storage.keys.USER_KEY, res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    storage.clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthStoreContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthStoreContext.Provider>
  );
}
