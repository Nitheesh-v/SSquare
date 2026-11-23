import { apiRequest } from "@/lib/api-client";
import { BackendProduct, DivisionSlug } from "@/types";

export interface ProductsListResponse {
  items: BackendProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsService = {
  list(params?: { division?: DivisionSlug; search?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.division) searchParams.set("division", params.division);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiRequest<ProductsListResponse>(`/products${qs ? `?${qs}` : ""}`);
  },

  getByIdOrSlug(idOrSlug: string) {
    return apiRequest<BackendProduct>(`/products/${idOrSlug}`);
  },

  create(payload: Partial<BackendProduct> & { category: string }) {
    return apiRequest<BackendProduct>("/products", {
      method: "POST",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<{ deleted: boolean; id: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  },
};
