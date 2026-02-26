import React, { useState, useMemo, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart, 
  CheckCircle2, Tablet, Smartphone, Info, X, Banknote, 
  Bluetooth, CreditCard, Wifi, WifiOff 
} from "lucide-react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Product, CartItem, Transaction, PaymentMethod } from "@/types/pos";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckout, setIsCheckout] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentMethod | null>(null);
  const [isReceipt, setIsReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  // Payment States
  const [cashAmount, setCashAmount] = useState("");
  const [mayaConnected, setMayaConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load products from LocalStorage or Initial Data
  useEffect(() => {
    const savedProducts = localStorage.getItem("pocketpos_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  // Save products whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("pocketpos_products", JSON.stringify(products));
    }
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Cart logic
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // Add "Turbo-Tap" handler
  const handleTurboTap = (e: React.MouseEvent | React.TouchEvent, product: Product) => {
    e.preventDefault();
    addToCart(product, 5);
    // Simple vibration feedback if supported
    if (window.navigator.vibrate) window.navigator.vibrate(50);
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

  // Mock Maya Terminal Check
  const checkMayaTerminal = () => {
    setIsConnecting(true);
    // Simulate high-speed BT handshake
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for mock
      setMayaConnected(success);
      setIsConnecting(false);
      if (success) {
        setActivePayment("maya_terminal");
      }
    }, 800);
  };

  const completeSale = (method: PaymentMethod, paid: number = total, ref: string = "") => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const transaction: Transaction = {
      id: `ORD-${orderNumber}`,
      items: [...cart],
      total,
      paymentMethod: method,
      amountPaid: paid,
      change: Math.max(0, paid - total),
      timestamp: Date.now(),
      referenceNo: ref
    };

    // Auto-decrement inventory (In-memory for MVP)
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) product.stock -= item.quantity;
    });

    setLastTransaction(transaction);
    setCart([]);
    setIsCheckout(false);
    setActivePayment(null);
    setIsReceipt(true);
  };

  if (isReceipt && lastTransaction) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center font-mono">
        <div className="w-full max-w-sm border-2 border-black p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black">POCKETPOS PH</h2>
            <p className="text-sm uppercase">{lastTransaction.id}</p>
            <p className="text-xs">{new Date(lastTransaction.timestamp).toLocaleString()}</p>
          </div>
          <div className="border-y-2 border-black py-4 mb-4 space-y-1">
            {lastTransaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>P{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-black text-xl mb-2">
            <span>TOTAL</span>
            <span>P{lastTransaction.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>PAID ({lastTransaction.paymentMethod.replace('_', ' ').toUpperCase()})</span>
            <span>P{lastTransaction.amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>CHANGE</span>
            <span>P{lastTransaction.change.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setIsReceipt(false)}
            className="w-full bg-black text-white py-4 font-black text-xl active:bg-slate-800"
          >
            NEXT ORDER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden select-none">
      <SEO title="POS | PocketPOS PH" />
      
      {/* Search Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2"><ArrowLeft className="w-6 h-6" /></Link>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* 3-Column Mobile Grid */}
      <main className="flex-1 overflow-y-auto p-2 pb-40">
        <div className="grid grid-cols-3 gap-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              onContextMenu={(e) => handleTurboTap(e, product)}
              className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 active:scale-95 active:bg-slate-50 transition-all touch-manipulation"
            >
              <span className="text-2xl mb-1">{product.emoji || '📦'}</span>
              <span className="text-[10px] font-bold uppercase leading-tight line-clamp-2 mb-1">{product.name}</span>
              <span className="text-xs font-black text-blue-600 active:text-white">₱{product.price}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 p-4 shadow-2xl z-20">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-black text-slate-900">₱{total.toFixed(2)}</span>
          </div>
          <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
            {cart.length} ITEMS
          </div>
        </div>
        <button
          disabled={cart.length === 0}
          onClick={() => setIsCheckout(true)}
          className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
        >
          CHECKOUT
        </button>
      </div>

      {/* Payment Selection Overlay */}
      {isCheckout && !activePayment && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 p-6 flex flex-col justify-end">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic">SELECT PAYMENT</h2>
              <button onClick={() => setIsCheckout(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActivePayment('cash')}
                className="h-32 border-4 border-green-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-green-50"
              >
                <Banknote className="w-8 h-8 text-green-600" />
                <span className="font-black text-green-700">CASH</span>
              </button>
              
              <button 
                onClick={() => setActivePayment('gcash_maya')}
                className="h-32 border-4 border-blue-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-blue-50"
              >
                <Smartphone className="w-8 h-8 text-blue-600" />
                <span className="font-black text-blue-700 leading-tight">GCASH /<br/>MAYA</span>
              </button>

              <button 
                onClick={checkMayaTerminal}
                className="h-32 border-4 border-slate-900 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-slate-50 relative overflow-hidden"
              >
                {isConnecting ? (
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <Bluetooth className="w-8 h-8 text-blue-500" />
                    <span className="text-[10px] font-bold">LINKING...</span>
                  </div>
                ) : (
                  <>
                    <Bluetooth className="w-8 h-8 text-slate-900" />
                    <span className="font-black text-slate-900">MAYA TERM</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => setActivePayment('card')}
                className="h-32 border-4 border-purple-500 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-purple-50"
              >
                <CreditCard className="w-8 h-8 text-purple-600" />
                <span className="font-black text-purple-700">CARD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Flow */}
      {activePayment === 'cash' && (
        <div className="fixed inset-0 bg-white z-[60] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">CASH PAYMENT</h2>
            <button onClick={() => setActivePayment(null)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <div className="text-center mb-8">
            <p className="text-slate-400 font-bold uppercase text-xs">Total Due</p>
            <p className="text-5xl font-black">₱{total.toFixed(2)}</p>
          </div>
          <input 
            type="number" 
            placeholder="Amount Tendered" 
            autoFocus
            className="w-full text-4xl font-black text-center border-b-4 border-slate-900 py-4 mb-8 outline-none"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[100, 200, 500, 1000].map(amt => (
              <button 
                key={amt} 
                onClick={() => setCashAmount(amt.toString())}
                className="bg-slate-100 py-4 rounded-xl font-bold active:bg-slate-200"
              >
                ₱{amt}
              </button>
            ))}
            <button 
              onClick={() => setCashAmount(total.toString())}
              className="bg-blue-100 text-blue-700 py-4 rounded-xl font-bold col-span-2 active:bg-blue-200"
            >
              EXACT AMOUNT
            </button>
          </div>
          <button 
            disabled={!cashAmount || parseFloat(cashAmount) < total}
            onClick={() => completeSale('cash', parseFloat(cashAmount))}
            className="mt-auto w-full bg-green-600 text-white py-6 rounded-2xl font-black text-2xl active:scale-95 transition-all disabled:bg-slate-200"
          >
            CONFIRM PAID
          </button>
        </div>
      )}

      {/* GCash/Maya QR Flow */}
      {activePayment === 'gcash_maya' && (
        <div className="fixed inset-0 bg-white z-[60] p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">GCASH / MAYA</h2>
            <button onClick={() => setActivePayment(null)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <p className="font-bold text-slate-500 mb-2 uppercase text-xs">Customer Scans QR PH</p>
          <div className="aspect-square w-full max-w-[280px] bg-white border-8 border-slate-900 p-4 mb-4 flex items-center justify-center relative">
            {/* Simple Mock QR */}
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <Smartphone className="w-20 h-20 text-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white px-4 py-2 font-black border-4 border-slate-900 uppercase">QR PH</span>
            </div>
          </div>
          <p className="text-3xl font-black mb-8 italic">₱{total.toFixed(2)}</p>
          <div className="w-full bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 mb-8">
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Status</p>
            <p className="text-sm font-bold text-blue-900">Waiting for customer scan...</p>
          </div>
          <button 
            onClick={() => completeSale('gcash_maya')}
            className="mt-auto w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-2xl active:scale-95 transition-all"
          >
            CONFIRM RECEIVED
          </button>
        </div>
      )}

      {/* Maya Terminal Link Flow */}
      {activePayment === 'maya_terminal' && (
        <div className="fixed inset-0 bg-white z-[60] p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">MAYA TERMINAL</h2>
            <button onClick={() => setActivePayment(null)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {mayaConnected ? (
              <div className="space-y-6">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-500 animate-pulse">
                  <Wifi className="w-16 h-16 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">TERMINAL READY</h3>
                  <p className="text-slate-500 font-bold">Waiting for card/swipe...</p>
                </div>
                <p className="text-5xl font-black text-slate-900">₱{total.toFixed(2)}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-red-500">
                  <WifiOff className="w-16 h-16 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-red-600 uppercase">Terminal Not Found</h3>
                  <p className="text-slate-500 font-bold px-8">Ensure Maya terminal is on and Bluetooth is active.</p>
                </div>
                <button 
                  onClick={checkMayaTerminal}
                  className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-sm active:scale-95"
                >
                  RETRY CONNECTION
                </button>
              </div>
            )}
          </div>

          {mayaConnected && (
            <button 
              onClick={() => completeSale('maya_terminal')}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-2xl active:scale-95 transition-all"
            >
              FINALIZE SALE
            </button>
          )}
        </div>
      )}

    </div>
  );
}