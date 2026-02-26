export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: "cash" | "e-wallet" | "card";
  amountPaid: number;
  change: number;
  timestamp: number;
}