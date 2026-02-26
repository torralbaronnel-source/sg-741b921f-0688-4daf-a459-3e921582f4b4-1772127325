export interface Product {
  id: string;
  name: string;
  price: number; // Base Price
  stock: number;
  category: string;
  emoji?: string;
  taxRate?: number; // e.g., 12 for 12% VAT
  discount?: number; // e.g., 5 for 5 pesos off
  cost?: number; // For profit calculation
}

export type PaymentMethod = "CASH" | "GCASH_MAYA" | "CARD" | "MAYA_TERMINAL";

export interface SaleItem extends Product {
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  orderNo: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: "PAID" | "PENDING" | "CANCELLED";
  createdAt: string;
  providerRef?: string;
  items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}