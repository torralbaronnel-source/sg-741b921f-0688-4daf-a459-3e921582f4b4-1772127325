export type PaymentMethod = "CASH" | "QR_PH" | "MAYA_TERMINAL";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number; // VAT inclusive
  cost: number;  // Supplier cost
  stock: number;
  lowStockThreshold: number;
  category: string;
  emoji?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  orderNo: string;
  items: CartItem[];
  subtotal: number; // Total / 1.12
  tax: number;      // Total - Subtotal
  total: number;    // Gross
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