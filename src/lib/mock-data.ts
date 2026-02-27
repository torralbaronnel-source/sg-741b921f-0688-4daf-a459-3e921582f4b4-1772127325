import { Product, Category, Sale, InventoryMovement, AppSettings } from "@/types/pos";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Coffee", slug: "coffee" },
  { id: "2", name: "Pastry", slug: "pastry" },
  { id: "3", name: "Food", slug: "food" },
  { id: "4", name: "Merch", slug: "merch" },
];

export const INITIAL_SETTINGS: AppSettings = {
  shopName: "POCKETPOS PH",
  shopAddress: "Manila, Philippines",
  tin: "123-456-789-000",
  categories: [
    { id: "cat-1", name: "COFFEE", slug: "COFFEE" },
    { id: "cat-2", name: "PASTRY", slug: "PASTRY" },
    { id: "cat-3", name: "MERCH", slug: "MERCH" },
  ],
};

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", sku: "CF-001", name: "Espresso", price: 80, cost: 15, stock: 49, lowStockThreshold: 10, category: "Coffee", emoji: "☕" },
  { id: "2", sku: "CF-002", name: "Americano", price: 90, cost: 18, stock: 44, lowStockThreshold: 10, category: "Coffee", emoji: "☕" },
  { id: "3", sku: "CF-003", name: "Latte", price: 120, cost: 35, stock: 11, lowStockThreshold: 5, category: "Coffee", emoji: "🥛" },
  { id: "4", sku: "CF-004", name: "Cappuccino", price: 120, cost: 35, stock: 4, lowStockThreshold: 5, category: "Coffee", emoji: "☕" },
  { id: "5", sku: "PS-001", name: "Croissant", price: 110, cost: 45, stock: 12, lowStockThreshold: 3, category: "Pastry", emoji: "🥐" },
  { id: "6", sku: "PS-002", name: "Choco Cake", price: 150, cost: 60, stock: 10, lowStockThreshold: 2, category: "Pastry", emoji: "🍰" },
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { id: "m1", productId: "4", productName: "Cappuccino", type: "STOCK_IN", quantity: 20, timestamp: new Date(Date.now() - 86400000).toISOString(), reason: "Supplier Delivery" },
  { id: "m2", productId: "3", productName: "Latte", type: "WASTE", quantity: -2, timestamp: new Date(Date.now() - 43200000).toISOString(), reason: "Spilled/Waste" },
];

export const MOCK_SALES: Sale[] = [];