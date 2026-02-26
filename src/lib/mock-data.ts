import { Product } from "@/types/pos";

/**
 * INITIAL_PRODUCTS: The starting inventory if no data exists in localStorage.
 * For a fresh production build, we keep this empty or with minimal essentials.
 */
export const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Sample Item", price: 100, stock: 10, category: "General", emoji: "📦", taxRate: 12, discount: 0 }
];

// Mock Transactions are removed. History now builds from real sales in localStorage.