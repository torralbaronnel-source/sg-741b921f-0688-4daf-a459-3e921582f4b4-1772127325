import React, { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Product, CartItem } from "@/types/pos";
import { 
  ArrowLeft, 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function POSPage() {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO title="Point of Sale | PocketPOS PH" />
      
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="flex items-center space-x-4 max-w-lg mx-auto w-full">
          <Link href="/" className="p-2 -ml-2 text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 bg-slate-100 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map((product) => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center active:bg-blue-50 transition-colors text-left"
            >
              <div>
                <p className="font-bold text-slate-800">{product.name}</p>
                <p className="text-slate-500 text-xs">{product.category} • {product.stock} in stock</p>
              </div>
              <p className="font-bold text-blue-600">₱{product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </main>

      {/* Cart Sheet / Bottom Drawer UI */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-[2rem] shadow-2xl z-30 max-w-lg mx-auto overflow-hidden">
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Cart ({cart.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-red-500 hover:text-red-600">
                Clear
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-slate-500 text-xs">₱{item.price.toFixed(2)} / pc</p>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">₱{total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100"
                onClick={() => setShowCheckout(true)}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Receipt/Success Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Successful</h2>
              <p className="text-slate-500">Transaction #1043</p>
            </div>

            <div className="border-y border-dashed py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Paid</span>
                <span className="font-bold text-slate-900">₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-900 uppercase">Cash</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-slate-900 py-6 rounded-2xl font-bold" onClick={() => {
                setCart([]);
                setShowCheckout(false);
              }}>
                Done
              </Button>
              <Button variant="outline" className="w-full py-6 rounded-2xl font-bold border-slate-200">
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}