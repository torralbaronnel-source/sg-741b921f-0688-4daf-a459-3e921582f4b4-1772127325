export type PaymentMethod = "CASH" | "QR_PH" | "MAYA_TERMINAL";

export interface Category {
  id: string;
  name: string;
  image?: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  categoryId: string;
  stock: number;
  image?: string;
  sku: string;
  minStock?: number;
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