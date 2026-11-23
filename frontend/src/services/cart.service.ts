import { apiRequest } from "@/lib/api-client";

export const cartService = {
  getCart() {
    return apiRequest<any>("/cart");
  },

  addItem(payload: {
    productId: string;
    quantity: number;
    customSpecs?: string;
  }) {
    return apiRequest<any>("/cart/items", {
      method: "POST",
      body: payload,
    });
  },

  clearCart() {
    return apiRequest<any>("/cart", {
      method: "DELETE",
    });
  },
};
