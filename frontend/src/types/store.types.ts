export type DivisionSlug = "rubber" | "steel" | "aluminium";

export interface Category {
  _id: string;
  name: string;
  slug: DivisionSlug | string;
  code?: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface BackendProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: Category | string;
  division: DivisionSlug;
  subCategory?: string;
  materialGrade: string;
  specifications?: string;
  description: string;
  unitPrice: number;
  currency: string;
  minOrderQty: number;
  customizable: boolean;
  inStock: boolean;
  image?: string;
}

export interface ProductCartLine {
  id: string;
  backendProductId?: string;
  name: string;
  sku: string;
  division: DivisionSlug;
  materialBadge: string;
  unitPrice: number;
  quantity: number;
  minOrderQty: number;
  customSpecs?: string;
  image: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderLineItem {
  product?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  customSpecs?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderType: "standard_order" | "custom_rfq";
  items: OrderLineItem[];
  shippingAddress: {
    contactName: string;
    company?: string;
    email: string;
    phone: string;
    addressLine?: string;
    city?: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  shippingMethod: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  drawingAvailable?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export interface QuotePrefill {
  division?: string;
  partName?: string;
  message?: string;
}
