import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, RotateCcw, Trash2, Banknote, QrCode, Plus, Minus, X, ArrowLeft, 
  ChevronRight, Printer, CheckCircle2, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { Product, CartItem, Sale, PaymentMethod, AppSettings, InventoryMovement } from "@/types/pos";
import { MOCK_PRODUCTS, INITIAL_SETTINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem("pos_products");
    const savedSettings = localStorage.getItem("pos_settings");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(MOCK_PRODUCTS);
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); handleCheckout("CASH"); }
      if (e.key === "F2") { e.preventDefault(); handleCheckout("QR_PH"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totals = useMemo(() => {
    const totalDue = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const subtotal = totalDue / 1.12;
    const tax = totalDue - subtotal;
    return { subtotal, tax, totalDue };
  }, [cart]);

  const handleCheckout = (method: PaymentMethod) => {
    if (cart.length === 0) return;
    
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      orderNo: (Math.floor(Math.random() * 9000) + 1000).toString(),
      items: [...cart],
      ...totals,
      total: totals.totalDue,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
      status: "PAID"
    };

    // Update stock and logs
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
    });

    const newMovements: InventoryMovement[] = cart.map(item => ({
      id: `m-${Date.now()}-${item.id}`,
      productId: item.id,
      productName: item.name,
      type: "SALE",
      quantity: -item.quantity,
      timestamp: new Date().toISOString(),
      reason: `Sale #${sale.orderNo}`
    }));

    const savedMovements = JSON.parse(localStorage.getItem("pos_movements") || "[]");
    localStorage.setItem("pos_products", JSON.stringify(updatedProducts));
    localStorage.setItem("pos_movements", JSON.stringify([...newMovements, ...savedMovements]));
    
    setProducts(updatedProducts);
    setLastSale(sale);
    setShowReceipt(true);
    setCart([]);
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <SEO title="Point of Sale - PocketPOS PH" />
      
      {/* Left Area: Product Grid */}
      <div className="flex-1 flex flex-col border-r border-slate-200">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 gap-4 sticky top-0 z-10">
          <Link href="/">
            <Button variant="ghost" size="icon" className="border border-slate-200">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search SKU or Name..." 
              className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 ring-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Button 
              variant={selectedCategory === "ALL" ? "default" : "outline"}
              onClick={() => setSelectedCategory("ALL")}
              className={cn("h-11 px-6 font-bold uppercase tracking-widest text-xs", selectedCategory === "ALL" ? "bg-[#0F172A]" : "border-slate-200")}
            >
              All
            </Button>
            {settings.categories.map(cat => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn("h-11 px-6 font-bold uppercase tracking-widest text-xs", selectedCategory === cat.slug ? "bg-[#0F172A]" : "border-slate-200")}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pos-grid-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product, idx) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "group relative flex flex-col text-left bg-white border border-slate-200 rounded-lg overflow-hidden transition-all active:scale-95",
                  product.stock <= 0 ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-blue-400 hover:shadow-md"
                )}
              >
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                      product.stock <= product.lowStockThreshold ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                    )}>
                      STK:{product.stock}
                    </span>
                  </div>
                  <div className="text-2xl mb-1">{product.emoji}</div>
                  <div className="font-bold text-slate-900 leading-tight uppercase text-sm">{product.name}</div>
                </div>
                <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                  <span className="font-mono font-bold text-slate-900">₱{product.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Right Sidebar: Ticket */}
      <div className="w-[420px] bg-white flex flex-col shadow-2xl relative">
        <header className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 uppercase tracking-tight">Current Ticket</h2>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Session</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest" onClick={() => setCart([])}>
            Void All
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-60">
              <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold uppercase tracking-widest text-xs">Cart is Empty</p>
                <p className="text-[10px]">Select products to start</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group animate-in slide-in-from-right-2 duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 uppercase text-sm leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">UNIT: ₱{item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-slate-50 transition-colors">
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <div className="px-4 font-mono font-bold text-sm w-12 text-center text-slate-900">{item.quantity}</div>
                    <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-slate-50 transition-colors">
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                  <button onClick={() => updateQty(item.id, -item.quantity)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Section */}
        <div className="bg-[#0F172A] text-white p-6 shadow-inner">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">₱{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>VAT (12%)</span>
              <span className="font-mono">₱{totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Total Due</span>
              <span className="text-4xl font-mono font-bold tracking-tighter">
                ₱{totals.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleCheckout("CASH")}
              disabled={cart.length === 0}
              className="group flex flex-col items-center justify-center gap-2 h-20 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl"
            >
              <Banknote className="w-6 h-6 text-slate-900" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">F1: CASH</span>
            </button>
            <button 
              onClick={() => handleCheckout("QR_PH")}
              disabled={cart.length === 0}
              className="group flex flex-col items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl shadow-lg shadow-blue-900/20"
            >
              <QrCode className="w-6 h-6 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">F2: DIGITAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-xs p-0 border-none bg-transparent shadow-none gap-0">
          <div className="bg-white p-8 rounded-none shadow-2xl relative overflow-hidden font-mono text-sm text-slate-900">
            {/* Scalloped edge effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_0,transparent_4px,#F1F5F9_4px,#F1F5F9_100%)] bg-[length:12px_12px]" />
            
            <div className="text-center space-y-2 mb-8 mt-4">
              <h2 className="text-xl font-bold uppercase tracking-tighter">{settings.shopName}</h2>
              <p className="text-[10px] uppercase leading-tight">{settings.shopAddress}</p>
              <p className="text-[10px]">TIN: {settings.tin}</p>
            </div>

            <div className="border-y border-dashed border-slate-300 py-3 mb-6 space-y-1">
              <div className="flex justify-between text-xs">
                <span>OR No:</span>
                <span className="font-bold">#{lastSale?.orderNo}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Date:</span>
                <span>{lastSale && new Date(lastSale.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {lastSale?.items.map(item => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="uppercase">{item.name}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {item.quantity} x ₱{item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-300 pt-4 space-y-2 mb-8">
              <div className="flex justify-between text-xs uppercase">
                <span>Subtotal</span>
                <span>₱{lastSale?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs uppercase">
                <span>VAT (12%)</span>
                <span>₱{lastSale?.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg uppercase pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span>₱{lastSale?.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="inline-block border-2 border-slate-900 px-4 py-1 font-bold uppercase text-xs">
                Paid via {lastSale?.paymentMethod.replace('_', ' ')}
              </div>
              <p className="text-[10px] uppercase leading-tight italic opacity-60">
                This serves as your official receipt.<br/>Thank you for your business!
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 h-11 bg-slate-900 rounded-none font-bold uppercase text-xs" onClick={() => setShowReceipt(false)}>
                  Close
                </Button>
                <Button variant="outline" className="flex-1 h-11 rounded-none border-slate-900 border-2 font-bold uppercase text-xs">
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}