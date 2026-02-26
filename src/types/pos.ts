export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'QR_PH' | 'CARD' | 'MAYA_TERMINAL';

export interface Sale {
  id: string;
  orderNo: string;
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: PaymentMethod;
  timestamp: string;
  createdAt: string;
}