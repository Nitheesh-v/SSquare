import { apiRequest } from "@/lib/api-client";
import { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

export const authService = {
  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  getMe() {
    return apiRequest<User>("/auth/me");
  },
};
