import { apiRequest } from "@/lib/api-client";
import { User } from "@/types";

export const usersService = {
  listAll() {
    return apiRequest<User[]>("/users");
  },

  updateMyProfile(payload: { name?: string; phone?: string; company?: string }) {
    return apiRequest<User>("/users/me", {
      method: "PATCH",
      body: payload,
    });
  },
};
