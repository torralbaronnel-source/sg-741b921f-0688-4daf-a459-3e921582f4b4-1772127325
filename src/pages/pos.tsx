import React, { useState, useEffect, useMemo, useRef } from "react";
import { SEO } from "@/components/SEO";
import { 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  Tag,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CartItem, PaymentMethod, Sale } from "@/types/pos";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();
  const { ref, inView } = useInView();

  // Infinite Scroll Logic
  useEffect(() => {
    if (inView) {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [inView]);

  const categories = ["All", ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently unavailable.`,
        variant: "destructive",
      });
      return;
    }

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

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = (method: PaymentMethod) => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      orderNo: `ORD-${Date.now().toString().slice(-6)}`,
      total: subtotal,
      subtotal: subtotal,
      tax: 0,
      discount: 0,
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

    setLastSale(newSale);
    setCart([]);
    setIsCheckoutOpen(false);
    
    // In a real app, we'd save this to a database/localStorage here
    const savedSales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    localStorage.setItem("pos_sales", JSON.stringify([newSale, ...savedSales]));
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F6F8] overflow-hidden">
      <SEO title="POS - PocketPOS PH" />

      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg text-slate-900">Ticket</h1>
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
            {totalItems} items
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-slate-100 border-none w-64 h-9 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Plus className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "ghost"}
            size="sm"
            className={`rounded-full px-4 h-8 text-xs font-medium ${
              selectedCategory === cat ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
            onClick={() => {
              setSelectedCategory(cat);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
          >
            {cat}
          </Button>
        ))}
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Product Grid - 5 Columns High Density */}
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                >
                  <Card className="relative aspect-square flex flex-col items-center justify-center p-2 cursor-pointer hover:shadow-md transition-all border-slate-100 overflow-hidden group">
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 z-10">
                        <Tag className="w-2.5 h-2.5" />
                        {product.discount}%
                      </div>
                    )}

                    {/* Stock Badge */}
                    <div className={`absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium z-10 ${
                      product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                      <Package className="w-2.5 h-2.5" />
                      {product.stock}
                    </div>

                    <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{product.emoji}</div>
                    <div className="text-[11px] font-semibold text-center leading-tight mb-0.5 text-slate-700 line-clamp-2">
                      {product.name}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[12px] font-bold text-slate-900">₱{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-[9px] text-slate-400 line-through">₱{product.originalPrice}</span>
                      )}
                    </div>

                    {/* Add overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-active:bg-black/5 transition-colors" />
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Intersection Observer for Infinite Scroll */}
            {filteredProducts.length > visibleCount && (
              <div ref={ref} className="col-span-full h-10 flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar (Ticket) */}
        <div className="hidden lg:flex w-80 bg-white border-l flex-col shadow-xl z-20">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold flex items-center gap-2">
              Current Ticket
              <Badge variant="outline" className="bg-white">{totalItems}</Badge>
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCart([])} disabled={cart.length === 0}>
              <Trash2 className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-50 mt-20">
                <ShoppingCart className="w-12 h-12" />
                <p className="text-sm font-medium">Ticket is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start group">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-500">₱{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold w-16 text-right">₱{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax (0%)</span>
                <span>₱0</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t">
                <span>Total</span>
                <span>₱{subtotal}</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-100"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              CHARGE ₱{subtotal}
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Bar (Ticket Trigger) */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t flex gap-3 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 h-12 rounded-xl relative">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ticket
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 overflow-hidden flex flex-col">
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-bold">Current Ticket</SheetTitle>
                  <Button variant="ghost" size="icon" onClick={() => setCart([])}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-20">
                    <ShoppingCart className="w-12 h-12" />
                    <p className="text-sm font-medium">Empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{item.name}</h3>
                          <p className="text-xs text-slate-500">₱{item.price}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2"><Plus className="w-4 h-4" /></button>
                          </div>
                          <span className="font-bold text-right min-w-[80px]">₱{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-6 bg-slate-50 border-t space-y-4">
                <div className="flex justify-between text-2xl font-black text-slate-900">
                  <span>Total</span>
                  <span>₱{subtotal}</span>
                </div>
                <Button 
                  className="w-full h-14 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl shadow-green-100"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCheckoutOpen(true);
                  }}
                >
                  CHARGE ₱{subtotal}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            className="flex-[2] h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
          >
            CHARGE ₱{subtotal}
          </Button>
        </div>
      </main>

      {/* Checkout Selection Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black">Select Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 group transition-all"
              onClick={() => handleCheckout("CASH")}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">💵</div>
              <span className="font-bold">CASH</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-purple-500 hover:bg-purple-50 group transition-all"
              onClick={() => handleCheckout("QR_PH")}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">📱</div>
              <span className="font-bold">QR PH</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-orange-500 hover:bg-orange-50 group transition-all"
              onClick={() => handleCheckout("CARD")}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">💳</div>
              <span className="font-bold">CARD</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-teal-500 hover:bg-teal-50 group transition-all"
              onClick={() => handleCheckout("MAYA_TERMINAL")}
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">🖥️</div>
              <span className="font-bold">MAYA TERM</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Receipt Dialog */}
      <Dialog open={!!lastSale} onOpenChange={() => setLastSale(null)}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-slate-50 border-none rounded-3xl">
          <div className="p-8 flex flex-col items-center text-center bg-white">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">PAID!</h2>
            <p className="text-slate-500 font-medium mb-1">Order {lastSale?.orderNo}</p>
            <div className="text-4xl font-black text-slate-900 mt-4">
              ₱{lastSale?.total}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment</span>
                <span className="font-bold text-slate-900">{lastSale?.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="font-bold text-slate-900">
                  {lastSale ? new Date(lastSale.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl font-bold border-2">
                PRINT
              </Button>
              <Button 
                className="h-12 rounded-xl font-bold bg-slate-900 text-white"
                onClick={() => setLastSale(null)}
              >
                DONE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}