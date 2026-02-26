export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  emoji?: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'QR_PH' | 'CARD' | 'MAYA_TERMINAL';
export type SaleStatus = 'PAID' | 'PAYMENT_PENDING' | 'CANCELLED';

export interface Sale {
  id: string;
  orderNo: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  providerRef?: string;
  timestamp: string;
  createdAt: string;
}

export type SubscriptionTier = "FREE" | "BASIC";

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
  lowStockThreshold: number;
  autoPrintReceipt: boolean;
  enableVat: boolean;
  subscriptionTier: SubscriptionTier;
  monthlyTransactionCount: number;
}