import { Product, Sale } from "@/types/pos";

/**
 * INITIAL_PRODUCTS: The starting inventory for the POS
 */
export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Espresso", price: 80, stock: 50, category: "Coffee", emoji: "☕", taxRate: 12, discount: 0 },
  { id: "2", name: "Americano", price: 90, stock: 45, category: "Coffee", emoji: "☕" },
  { id: "3", name: "Latte", price: 120, stock: 12, category: "Coffee", emoji: "🥛", discount: 15, originalPrice: 140 },
  { id: "4", name: "Cappuccino", price: 120, stock: 5, category: "Coffee", emoji: "☁️" },
  { id: "5", name: "Espresso", price: 70, stock: 100, category: "Coffee", emoji: "⚡" },
  { id: "6", name: "Mocha", price: 130, stock: 8, category: "Coffee", emoji: "🍫", discount: 10, originalPrice: 145 },
  { id: "7", name: "Caramel Macchiato", price: 140, stock: 15, category: "Coffee", emoji: "🍯" },
  { id: "8", name: "Iced Coffee", price: 95, stock: 30, category: "Coffee", emoji: "🧊" },
  { id: "9", name: "Cold Brew", price: 110, stock: 20, category: "Coffee", emoji: "❄️" },
  { id: "10", name: "Chocolate Cake", price: 150, stock: 10, category: "Pastry", emoji: "🍰", taxRate: 12, discount: 0 },
  { id: "11", name: "Blueberry Muffin", price: 85, stock: 15, category: "Pastry", emoji: "🧁", taxRate: 12, discount: 0 },
  { id: "12", name: "Croissant", price: 95, stock: 12, category: "Pastry", emoji: "🥐", taxRate: 12, discount: 0 },
  { id: "13", name: "Egg Sandwich", price: 120, stock: 8, category: "Food", emoji: "🥪", taxRate: 12, discount: 0 },
];

export const MOCK_SALES: Sale[] = [
  {
    id: "1",
    orderNo: "POS-9842",
    total: 320,
    subtotal: 320,
    tax: 0,
    discount: 0,
    status: "PAID",
    paymentMethod: "CASH",
    items: [
      { id: "1", name: "Espresso", quantity: 2, price: 80 },
      { id: "3", name: "Latte", quantity: 1, price: 120 }
    ],
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    orderNo: "POS-9843",
    total: 250,
    subtotal: 250,
    tax: 0,
    discount: 0,
    status: "PAID",
    paymentMethod: "QR_PH",
    providerRef: "TXN123456789",
    items: [
      { id: "10", name: "Chocolate Cake", quantity: 1, price: 150 },
      { id: "2", name: "Americano", quantity: 1, price: 100 }
    ],
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];