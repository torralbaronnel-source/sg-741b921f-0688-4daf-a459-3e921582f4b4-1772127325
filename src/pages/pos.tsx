import React, { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Product, CartItem, Transaction } from "@/types/pos";

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckout, setIsCheckout] = useState(false);
  const [isReceipt, setIsReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // High-speed cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleCheckout = (method: string) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000); // Simple sequential mock
    const transaction: Transaction = {
      id: `ORD-${orderNumber}`,
      items: [...cart],
      total,
      paymentMethod: method as any,
      amountPaid: total,
      change: 0,
      timestamp: Date.now(),
    };
    setLastTransaction(transaction);
    setPaymentMethod(method);
    setIsCheckout(false);
    setIsReceipt(true);
    setCart([]);
  };

  if (isReceipt && lastTransaction) {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center font-mono">
        <div className="w-full max-w-sm border-2 border-slate-900 p-6 bg-white text-black">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black">POCKETPOS PH</h2>
            <p className="text-sm">ORDER #{lastTransaction.id}</p>
            <p className="text-xs">{new Date(lastTransaction.timestamp).toLocaleString()}</p>
          </div>
          <div className="space-y-1 mb-6 border-y-2 border-black py-4">
            {lastTransaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>P{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-black text-xl mb-4">
            <span>TOTAL</span>
            <span>P{lastTransaction.total.toFixed(2)}</span>
          </div>
          <div className="text-xs text-center border-t border-black pt-4 mb-8">
            PAYMENT: {paymentMethod?.toUpperCase()}
            <br />
            THANK YOU FOR YOUR BUSINESS
          </div>
          <button 
            onClick={() => setIsReceipt(false)}
            className="w-full bg-black text-white py-5 font-black text-xl active:bg-slate-800"
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      <SEO title="POS | PocketPOS PH" />
      
      {/* Header - Simple & Static */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-bold text-lg">New Order</h1>
        </div>
        <div className="relative flex-1 max-w-[180px] ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Grid Area - 3 Columns for Mobile */}
      <main className="flex-1 overflow-y-auto p-3 pb-40">
        <div className="grid grid-cols-3 gap-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="aspect-square bg-white border border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center text-center active:bg-blue-50 active:border-blue-200"
            >
              <span className="text-2xl mb-1">{product.category === 'Drinks' ? '🥤' : product.category === 'Rice' ? '🍚' : '📦'}</span>
              <span className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight uppercase">{product.name}</span>
              <span className="text-xs font-black text-blue-600 mt-1">₱{product.price}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Sticky Bottom Cart & Checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-4 shadow-2xl z-20">
        {cart.length > 0 && (
          <div className="max-h-32 overflow-y-auto mb-4 space-y-2 border-b border-slate-100 pb-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase">{item.name}</span>
                  <span className="text-[10px] text-slate-500">₱{item.price} ea</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Total Amount</span>
            <span className="text-3xl font-black text-slate-900">₱{total.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold">{cart.length} items</span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={() => setIsCheckout(true)}
          className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black text-xl shadow-lg active:scale-[0.98] transition-all"
        >
          CHECKOUT
        </button>
      </div>

      {/* Checkout Selection - Full Screen Overlay */}
      {isCheckout && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 p-6 flex flex-col justify-end">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">SELECT PAYMENT</h2>
              <button onClick={() => setIsCheckout(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleCheckout('cash')} className="aspect-square border-4 border-green-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-green-50">
                <span className="text-3xl">💵</span>
                <span className="font-bold text-green-700">CASH</span>
              </button>
              <button onClick={() => handleCheckout('e-wallet')} className="aspect-square border-4 border-blue-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-blue-50">
                <span className="text-3xl">📱</span>
                <span className="font-bold text-blue-700 uppercase">QR PH</span>
              </button>
              <button onClick={() => handleCheckout('card')} className="aspect-square border-4 border-purple-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-purple-50">
                <span className="text-3xl">💳</span>
                <span className="font-bold text-purple-700">CARD</span>
              </button>
              <button onClick={() => handleCheckout('maya')} className="aspect-square border-4 border-slate-900 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-slate-50">
                <span className="text-3xl">🖥️</span>
                <span className="font-bold text-slate-900">MAYA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}