export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  emoji: string;
  taxRate?: number;
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