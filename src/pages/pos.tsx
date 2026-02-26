import React, { useState, useEffect, useMemo, useRef } from "react";
import { SEO } from "@/components/SEO";
import { 
  Search, 
  ShoppingCart, 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Receipt,
  Printer,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Product, CartItem, Sale, PaymentMethod } from "@/types/pos";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<Sale | null>(null);

  const { ref, inView } = useInView();

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleItemsCount);
  }, [filteredProducts, visibleItemsCount]);

  useEffect(() => {
    if (inView && visibleItemsCount < filteredProducts.length) {
      setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [inView, filteredProducts.length, visibleItemsCount]);

  const categories = ["All", ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (method: PaymentMethod) => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      orderNo: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      total,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: method,
      status: "PAID",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setPaymentSuccess(newSale);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-hidden flex flex-col">
      <SEO title="Terminal | PocketPOS PH" />

      {/* Modern Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 tap-active">
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </Link>
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 h-11 bg-slate-100/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar -mx-4 px-4 mt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleItemsCount(ITEMS_PER_PAGE);
              }}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all tap-active ${
                selectedCategory === cat 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105" 
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* High-Performance Product Grid */}
      <main className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="grid grid-cols-2 gap-3 pb-24">
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => addToCart(product)}
                className="glass-card rounded-[2rem] p-4 flex flex-col items-center text-center relative overflow-hidden active:bg-blue-50/50 group"
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{product.emoji}</div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 h-10">{product.name}</h3>
                <div className="mt-2 text-blue-600 font-black text-base">₱{product.price}</div>
                
                {cart.find(item => item.id === product.id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                    {cart.find(item => item.id === product.id)?.quantity}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div ref={ref} className="col-span-2 h-10 flex items-center justify-center">
            {visibleItemsCount < filteredProducts.length && (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </main>

      {/* Floating Modern Cart Bar */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-slate-900 text-white rounded-[2rem] p-4 shadow-2xl shadow-slate-400 flex items-center justify-between tap-active group overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">View Order</p>
                  <p className="font-black text-lg">₱{total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{cart.length} items</span>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer - Modern Full Screen */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-md p-0 h-[90vh] rounded-t-[3rem] top-[auto] bottom-0 translate-y-0 border-none glass-card overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-8 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">Current Order</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">Verify items before payment</DialogDescription>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-100 rounded-full tap-active">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar">
            {cart.map(item => (
              <motion.div 
                layout
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100/50"
              >
                <div className="text-3xl">{item.emoji}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-blue-600 font-bold text-sm">₱{item.price}</p>
                </div>
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-slate-400 tap-active"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-blue-600 tap-active"><Plus className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-slate-100 rounded-t-[3rem]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-bold">Total Amount</span>
              <span className="text-3xl font-black text-slate-900">₱{total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full h-16 rounded-[2rem] text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 tap-active"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Select Payment Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modern Checkout Grid */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-[3rem] border-none glass-card">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-black">Choose Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'CASH', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
              { id: 'QR_PH', name: 'QR PH', icon: QrCode, color: 'bg-blue-600' },
              { id: 'CARD', name: 'Card', icon: CreditCard, color: 'bg-slate-900' },
              { id: 'MAYA_TERMINAL', name: 'Maya Term', icon: Smartphone, color: 'bg-purple-600' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => handleCheckout(method.id as PaymentMethod)}
                className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 tap-active hover:ring-2 hover:ring-blue-500/20"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${method.color} shadow-lg shadow-current/20`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <span className="font-black text-slate-900">{method.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Realistic Digital Receipt */}
      <Dialog open={!!paymentSuccess} onOpenChange={() => setPaymentSuccess(null)}>
        <DialogContent className="sm:max-w-md p-0 rounded-[3rem] border-none overflow-hidden glass-card">
          <div className="bg-green-500 p-10 text-center text-white">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h2 className="text-3xl font-black">Paid Successfully!</h2>
            <p className="opacity-80 font-medium">Order {paymentSuccess?.orderNo}</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Paid</span>
                <span className="text-2xl font-black text-slate-900">₱{paymentSuccess?.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Method</span>
                <Badge className="bg-slate-900 text-white font-bold">{paymentSuccess?.paymentMethod}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 rounded-2xl font-bold border-slate-200 tap-active">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button className="h-14 rounded-2xl font-bold bg-slate-900 text-white tap-active" onClick={() => setPaymentSuccess(null)}>
                New Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}