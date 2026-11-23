import { apiRequest } from "@/lib/api-client";
import { Order, OrderStatus } from "@/types";

export interface CreateOrderInput {
  shippingAddress: {
    contactName: string;
    company?: string;
    email: string;
    phone: string;
    addressLine?: string;
    city?: string;
    country: string;
  };
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    customSpecs?: string;
  }>;
  drawingAvailable?: string;
  notes?: string;
}

export const ordersService = {
  createOrder(payload: CreateOrderInput) {
    return apiRequest<Order>("/orders", {
      method: "POST",
      body: payload,
    });
  },

  listOrders() {
    return apiRequest<Order[]>("/orders");
  },

  updateStatus(id: string, payload: { status: OrderStatus; trackingNumber?: string }) {
    return apiRequest<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: payload,
    });
  },
};
