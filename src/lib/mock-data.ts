import { Product, Category, Sale, InventoryMovement, AppSettings } from "@/types/pos"

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Coffee", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", color: "blue" },
  { id: "cat-2", name: "Pastries", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", color: "amber" },
  { id: "cat-3", name: "Bottled Drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", color: "green" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Espresso",
    price: 95,
    cost: 15,
    categoryId: "cat-1",
    stock: 150,
    sku: "CF-001",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=100&h=100&fit=crop",
    minStock: 20
  },
  {
    id: "prod-2",
    name: "Cappuccino",
    price: 145,
    cost: 35,
    categoryId: "cat-1",
    stock: 12,
    sku: "CF-002",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=100&h=100&fit=crop",
    minStock: 15
  },
  {
    id: "prod-3",
    name: "Glazed Donut",
    price: 55,
    cost: 22,
    categoryId: "cat-2",
    stock: 45,
    sku: "PS-001",
    image: "https://images.unsplash.com/photo-1527324688102-d8a8b13d7e85?w=100&h=100&fit=crop",
    minStock: 10
  }
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { 
    id: "mov-1", 
    productId: "prod-1", 
    productName: "Espresso",
    quantity: 50, 
    type: "STOCK_IN", 
    timestamp: new Date().toISOString(), 
    reason: "Restock" 
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  shopName: "PocketPOS Coffee",
  shopAddress: "123 BGC, Taguig, Philippines",
  tin: "000-123-456-789",
  categories: MOCK_CATEGORIES
};

export const MOCK_SALES: Sale[] = [];