import React, { useState, useEffect, useMemo, useRef } from "react";
import { SEO } from "@/components/SEO";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  X, 
  ChevronRight,
  Package,
  ArrowLeft,
  LayoutGrid,
  CreditCard,
  Banknote,
  QrCode,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Product, CartItem, PaymentMethod, Sale, StoreSettings } from "@/types/pos";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import Link from "next/link";

const VAT_RATE = 0.12;

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load products and settings
  useEffect(() => {
    const savedProducts = localStorage.getItem("pocketpos_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(MOCK_PRODUCTS);
      localStorage.setItem("pocketpos_products", JSON.stringify(MOCK_PRODUCTS));
    }

    const savedSettings = localStorage.getItem("pocketpos_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ["All", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
  [cart]);
  
  const tax = settings?.enableVat ? subtotal * VAT_RATE : 0;
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
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

  const handleCheckout = (method: PaymentMethod) => {
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      orderNo: `ORD-${Date.now().toString().slice(-4)}`,
      total,
      subtotal,
      tax,
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

    // Update stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem("pocketpos_products", JSON.stringify(updatedProducts));

    // Save sale
    const savedSales = JSON.parse(localStorage.getItem("pocketpos_sales") || "[]");
    localStorage.setItem("pocketpos_sales", JSON.stringify([sale, ...savedSales]));

    // Update settings transaction count
    if (settings) {
      const updatedSettings = { ...settings, monthlyTransactionCount: (settings.monthlyTransactionCount || 0) + 1 };
      setSettings(updatedSettings);
      localStorage.setItem("pocketpos_settings", JSON.stringify(updatedSettings));
    }

    setLastSale(sale);
    setShowReceipt(true);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <SEO title="POS - PocketPOS PH" />

      {/* Header & Categories */}
      <header className="sticky top-0 z-30 glass-card border-b-0 rounded-none px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          </div>
          
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-slate-100 border-none h-10 rounded-xl focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button 
            variant="outline" 
            className="relative h-10 w-10 p-0 rounded-xl border-slate-200 md:hidden"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 md:flex md:gap-6 max-w-[1600px] mx-auto">
        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "group relative flex flex-col items-center p-3 rounded-2xl transition-all active:scale-95 text-center overflow-hidden",
                  product.stock <= 0 
                    ? "opacity-50 grayscale cursor-not-allowed" 
                    : "bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100"
                )}
              >
                {/* Stock Badge */}
                <div className={cn(
                  "absolute top-1 right-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 z-10",
                  product.stock < 5 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                )}>
                  <Package className="w-3 h-3" />
                  {product.stock}
                </div>

                {/* Discount Ribbon */}
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-br-lg z-10 shadow-sm uppercase tracking-tighter">
                    -{product.discount}%
                  </div>
                )}

                {/* Visual */}
                <div className="w-full aspect-square mb-2 bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{product.emoji || "📦"}</span>
                  )}
                </div>

                <div className="w-full">
                  <h3 className="text-[13px] font-bold text-slate-900 leading-tight mb-1 truncate px-1">
                    {product.name}
                  </h3>
                  <div className="flex flex-col items-center">
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₱{product.originalPrice}
                      </span>
                    )}
                    <span className="text-sm font-black text-primary">
                      ₱{product.price}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Ticket Sidebar */}
        <aside className="hidden md:block w-96 glass-card p-6 h-[calc(100vh-120px)] sticky top-32 flex flex-col rounded-3xl border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Current Ticket 
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </h2>
            <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
              Void All
            </button>
          </div>

          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400">₱{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm font-bold">No items in ticket</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-bold">₱{subtotal.toFixed(2)}</span>
            </div>
            {settings?.enableVat && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>VAT (12%)</span>
                <span className="font-bold">₱{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-slate-900 uppercase">Total Due</span>
              <span className="text-2xl font-black text-primary tracking-tighter">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              onClick={() => handleCheckout("CASH")} 
              disabled={cart.length === 0}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex flex-col gap-0"
            >
              <Banknote className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">CASH</span>
            </Button>
            <Button 
              onClick={() => handleCheckout("QR_PH")} 
              disabled={cart.length === 0}
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold flex flex-col gap-0 shadow-lg shadow-primary/20"
            >
              <QrCode className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">CHARGE</span>
            </Button>
          </div>
        </aside>
      </main>

      {/* Mobile Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl border-0 p-4 pb-8 z-40 shadow-2xl flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Pay</span>
          <span className="text-2xl font-black text-primary tracking-tighter leading-none">₱{total.toFixed(2)}</span>
        </div>
        <Button 
          onClick={() => setIsCartOpen(true)}
          disabled={cart.length === 0}
          className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          View Ticket ({cart.reduce((s, i) => s + i.quantity, 0)})
        </Button>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden rounded-3xl border-none max-w-[90vw]">
          <div className="p-8 text-center bg-slate-50 border-b border-dashed border-slate-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-none mb-2">Paid ₱{lastSale?.total.toFixed(2)}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lastSale?.orderNo} • {lastSale?.paymentMethod}</p>
          </div>
          
          <ScrollArea className="max-h-[30vh] px-8 py-6">
            <div className="space-y-3">
              {lastSale?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">
                    <span className="font-black text-slate-900">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="font-bold text-slate-900">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="px-8 pb-8 pt-4 space-y-4">
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₱{lastSale?.subtotal.toFixed(2)}</span>
              </div>
              {lastSale?.tax !== 0 && (
                <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <span>VAT (12%)</span>
                  <span>₱{lastSale?.tax.toFixed(2)}</span>
                </div>
              )}
            </div>
            <Button onClick={() => setShowReceipt(false)} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95">
              Done & New Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}