export type PaymentMethod = "CASH" | "QR_PH" | "MAYA_TERMINAL";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  category: string;
  stock: number;
  image?: string;
  emoji?: string;
  sku?: string;
  lowStockThreshold?: number;
  hotkey?: string; // e.g., "1", "2" for quick add
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  orderNo: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalDue: number; // For terminal compatibility
  paymentMethod: PaymentMethod;
  timestamp: string;
  status?: "PAID" | "PENDING" | "CANCELLED";
  providerRef?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "STOCK_IN" | "SALE" | "WASTE" | "ADJUSTMENT";
  quantity: number;
  reason?: string;
  timestamp: string;
}

export interface AppSettings {
  shopName: string;
  shopAddress: string;
  tin?: string;
  categories: Category[];
}