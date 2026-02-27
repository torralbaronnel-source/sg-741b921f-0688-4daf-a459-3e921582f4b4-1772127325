import { Product, Category, Sale, InventoryMovement, AppSettings } from "@/types/pos";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Coffee", emoji: "☕", color: "#7C2D12" },
  { id: "2", name: "Pastry", emoji: "🥐", color: "#92400E" },
  { id: "3", name: "Food", emoji: "🍱", color: "#166534" },
  { id: "4", name: "Merch", emoji: "👕", color: "#2563EB" },
];

export const INITIAL_SETTINGS: AppSettings = {
  shopName: "POCKETPOS PH",
  shopAddress: "Manila, Philippines",
  tin: "123-456-789-000",
  categories: [
    { id: "cat-1", name: "COFFEE", emoji: "☕", color: "#7C2D12" },
    { id: "cat-2", name: "PASTRY", emoji: "🥐", color: "#92400E" },
    { id: "cat-3", name: "MERCH", emoji: "👕", color: "#2563EB" },
  ],
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Coffee", emoji: "☕", color: "#7C2D12", itemCount: 4 },
  { id: "cat-2", name: "Tea", emoji: "🍵", color: "#166534", itemCount: 1 },
  { id: "cat-3", name: "Pastries", emoji: "🥐", color: "#92400E", itemCount: 1 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Espresso",
    price: 95,
    cost: 15,
    category: "Coffee",
    categoryId: "cat-1",
    stock: 150,
    emoji: "☕",
    sku: "CF-001",
  },
  { id: "2", sku: "CF-002", name: "Americano", price: 90, cost: 18, stock: 44, category: "Coffee", categoryId: "cat-1", emoji: "☕" },
  { id: "3", sku: "CF-003", name: "Latte", price: 120, cost: 35, stock: 11, category: "Coffee", categoryId: "cat-1", emoji: "🥛" },
  { id: "4", sku: "CF-004", name: "Cappuccino", price: 120, cost: 35, stock: 4, category: "Coffee", categoryId: "cat-1", emoji: "☕" },
  { id: "5", sku: "PS-001", name: "Croissant", price: 110, cost: 45, stock: 12, category: "Pastries", categoryId: "cat-3", emoji: "🥐" },
  { id: "6", sku: "PS-002", name: "Choco Cake", price: 150, cost: 60, stock: 10, category: "Pastries", categoryId: "cat-3", emoji: "🍰" },
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { id: "m1", productId: "4", productName: "Cappuccino", type: "STOCK_IN", quantity: 20, timestamp: new Date(Date.now() - 86400000).toISOString(), reason: "Supplier Delivery" },
  { id: "m2", productId: "3", productName: "Latte", type: "WASTE", quantity: -2, timestamp: new Date(Date.now() - 43200000).toISOString(), reason: "Spilled/Waste" },
];

export const MOCK_SALES: Sale[] = [];