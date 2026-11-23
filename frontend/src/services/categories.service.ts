import { apiRequest } from "@/lib/api-client";
import { Category } from "@/types";

export const categoriesService = {
  list() {
    return apiRequest<Category[]>("/categories");
  },

  getByIdOrSlug(idOrSlug: string) {
    return apiRequest<Category>(`/categories/${idOrSlug}`);
  },
};
