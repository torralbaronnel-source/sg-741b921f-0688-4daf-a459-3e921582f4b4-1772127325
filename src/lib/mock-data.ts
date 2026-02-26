import { Product, Sale } from "@/types/pos";

/**
 * INITIAL_PRODUCTS: The starting inventory if no data exists in localStorage.
 * For a fresh production build, we keep this empty or with minimal essentials.
 */
export const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Sample Item", price: 100, stock: 10, category: "General", emoji: "📦", taxRate: 12, discount: 0 }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Iced Latte", price: 120, stock: 50, category: "Coffee", emoji: "☕" },
  { id: "2", name: "Espresso", price: 90, stock: 100, category: "Coffee", emoji: "☕" },
  { id: "3", name: "Ham & Cheese", price: 150, stock: 20, category: "Food", emoji: "🥪" },
  { id: "4", name: "Croissant", price: 85, stock: 15, category: "Food", emoji: "🥐" },
  { id: "5", name: "Matcha Latte", price: 140, stock: 30, category: "Tea", emoji: "🍵" },
];

export const MOCK_SALES: Sale[] = [
  {
    id: "1",
    orderNo: "ORD-9999",
    items: [
      { id: "1", name: "Sample Item", quantity: 2, price: 100 }
    ],
    total: 200,
    paymentMethod: "CASH",
    status: "PAID",
    createdAt: new Date().toISOString()
  }
];

// Mock Transactions are removed. History now builds from real sales in localStorage.