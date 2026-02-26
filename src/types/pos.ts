export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = "cash" | "gcash_maya" | "card" | "maya_terminal";

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  timestamp: number;
  referenceNo?: string;
}