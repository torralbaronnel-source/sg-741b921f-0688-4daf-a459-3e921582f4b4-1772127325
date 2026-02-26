import React, { useState, useEffect, useMemo, useRef } from "react";
import { SEO } from "@/components/SEO";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  X,
  CreditCard,
  Banknote,
  QrCode,
  Monitor,
  CheckCircle2,
  Printer,
  History,
  LayoutGrid,
  Settings,
  Package
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Product, SaleItem, Sale, PaymentMethod } from "@/types/pos";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const { toast } = useToast();

  const categories = useMemo(() => {
    return ["ALL", ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, total: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as SaleItem[]);
  };

  const handleCheckout = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // Simulate payment processing
    const orderNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      orderNo,
      total: cartTotal,
      paymentMethod: method,
      status: "PAID",
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    setCurrentSale(newSale);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    setCart([]);
    
    toast({
      title: "Success",
      description: `Order ${orderNo} completed via ${method.replace('_', ' ')}`,
    });
  };

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden">
      <SEO title="POS | PocketPOS PH" />
      
      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden lg:flex w-20 flex-col items-center py-8 bg-white border-r border-slate-200 gap-8">
        <div className="w-12 h-12 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white font-bold text-xl">P</div>
        <Link href="/pos" className="p-3 bg-blue-50 text-[#2563EB] rounded-xl"><Monitor className="w-6 h-6" /></Link>
        <Link href="/inventory" className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><Package className="w-6 h-6" /></Link>
        <Link href="/transactions" className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><History className="w-6 h-6" /></Link>
        <Link href="/settings" className="p-3 text-slate-400 hover:text-slate-600 transition-colors mt-auto"><Settings className="w-6 h-6" /></Link>
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-[#0F172A]">Main Terminal</div>
              <div className="text-xs text-emerald-500 font-medium">Online • Cashier 01</div>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
              C1
            </div>
          </div>
        </header>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat: string) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={cn(
                  "rounded-full px-6 h-10 whitespace-nowrap",
                  selectedCategory === cat ? "bg-[#2563EB]" : "bg-white text-slate-600 border-slate-200"
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(product)}
                className="group relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="text-4xl mb-3 h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                  {product.emoji || "📦"}
                </div>
                <h3 className="font-bold text-[#0F172A] leading-tight mb-1 group-hover:text-[#2563EB]">{product.name}</h3>
                <p className="text-[#2563EB] font-black">₱{product.price.toFixed(2)}</p>
                
                {/* Visual feedback for items in cart */}
                {cart.find(item => item.id === product.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {cart.find(item => item.id === product.id)?.quantity}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        <div className="lg:hidden h-20 bg-white border-t border-slate-200 px-4 flex items-center justify-between sticky bottom-0">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Total Balance</span>
            <span className="text-xl font-black text-[#0F172A]">₱{cartTotal.toFixed(2)}</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] h-12 rounded-xl px-6 gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cartCount})</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl px-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#2563EB]" />
                  Current Order
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-1">
                {cart.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-[#0F172A]">{item.name}</div>
                        <div className="text-sm text-slate-500">₱{item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-[#2563EB]"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-6 bg-white">
                <div className="flex justify-between items-center px-2">
                  <span className="text-slate-500 font-medium text-lg">Subtotal</span>
                  <span className="text-2xl font-black text-[#0F172A]">₱{cartTotal.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl text-lg font-bold shadow-lg shadow-blue-100"
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Pay Now
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>

      {/* Cart Panel (Desktop) */}
      <aside className="hidden lg:flex w-[400px] flex-col bg-white border-l border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#2563EB]" />
            Current Order
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-bold">No active items</p>
                <p className="text-sm">Select products to start</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id} 
                className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group"
              >
                <div className="text-2xl w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-[#0F172A] text-sm">{item.name}</div>
                  <div className="text-xs text-slate-500 font-medium">₱{item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-slate-50"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-[#2563EB] hover:bg-blue-50"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50/50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 font-medium text-sm">
              <span>Subtotal</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#0F172A] text-xl font-black pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
          >
            Review & Pay
          </Button>
        </div>
      </aside>

      {/* Payment Selection Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center mb-6">Choose Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-32 rounded-3xl flex-col gap-3 border-2 border-slate-100 hover:border-[#2563EB] hover:bg-blue-50 transition-all"
              onClick={() => handleCheckout("CASH")}
            >
              <Banknote className="w-10 h-10 text-emerald-500" />
              <span className="font-bold">Cash</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 rounded-3xl flex-col gap-3 border-2 border-slate-100 hover:border-[#2563EB] hover:bg-blue-50 transition-all"
              onClick={() => handleCheckout("GCASH_MAYA")}
            >
              <QrCode className="w-10 h-10 text-blue-500" />
              <span className="font-bold">QR PH</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 rounded-3xl flex-col gap-3 border-2 border-slate-100 hover:border-[#2563EB] hover:bg-blue-50 transition-all"
              onClick={() => handleCheckout("CARD")}
            >
              <CreditCard className="w-10 h-10 text-slate-700" />
              <span className="font-bold">Card</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 rounded-3xl flex-col gap-3 border-2 border-slate-100 hover:border-[#2563EB] hover:bg-blue-50 transition-all"
              onClick={() => handleCheckout("MAYA_TERMINAL")}
            >
              <Monitor className="w-10 h-10 text-blue-600" />
              <span className="font-bold">Maya Terminal</span>
            </Button>
          </div>
          <DialogFooter className="mt-6">
             <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-400" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] p-0 border-none bg-transparent shadow-none">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Payment Paid</h2>
            <p className="text-slate-500 mb-8">Order {currentSale?.orderNo} successful</p>
            
            <div className="w-full bg-slate-50 rounded-2xl p-6 space-y-3 mb-8">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Method</span>
                <span className="font-bold text-[#0F172A]">{paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                <span className="text-slate-600">Total</span>
                <span className="text-[#0F172A]">₱{currentSale?.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <Button className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl font-bold gap-2">
                <Printer className="w-5 h-5" />
                Print Receipt
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-slate-400 font-bold"
                onClick={() => setIsReceiptOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}