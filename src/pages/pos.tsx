import React, { useState, useEffect, useMemo, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  X,
  ArrowLeft,
  Image as ImageIcon
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS, INITIAL_SETTINGS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Product, CartItem, Sale, PaymentMethod, AppSettings } from "@/types/pos";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [settings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  
  const [activeQtyItem, setActiveQtyItem] = useState<CartItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalDue = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const subtotal = useMemo(() => totalDue / 1.12, [totalDue]);
  const tax = useMemo(() => totalDue - subtotal, [totalDue, subtotal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") {
        if (e.key === "Escape") searchInputRef.current?.blur();
        return;
      }
      if (e.key === "/" ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === "All" || p.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryId]);

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
      id: `sale-${Date.now()}`,
      orderNo: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      totalDue,
      subtotal,
      tax,
      total: totalDue,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
      status: "PAID"
    };
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));
    setLastSale(sale);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-sans">
      <SEO title="POS Terminal | PocketPOS PH" />
      
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors group">
            <ArrowLeft className="w-5 h-5 text-[#64748B] group-hover:text-[#2563EB]" />
          </Link>
          <div className="h-6 w-[1px] bg-[#E2E8F0] mx-1" />
          <h1 className="text-lg font-bold tracking-tight text-[#1E293B]">
            Pocket<span className="text-[#2563EB]">POS</span>
          </h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              ref={searchInputRef}
              placeholder="Search (SKU or Name)..." 
              className="pl-9 bg-slate-100 border-none h-10 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative md:hidden" onClick={() => setIsOrderPanelOpen(true)}>
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b bg-slate-50/50">
            <Button 
              variant={selectedCategoryId === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full shrink-0 h-9 px-5"
              onClick={() => setSelectedCategoryId("All")}
            >
              All Items
            </Button>
            {MOCK_CATEGORIES.map(cat => (
              <Button 
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                size="sm"
                className="rounded-full shrink-0 h-9 px-5 gap-2"
                onClick={() => setSelectedCategoryId(cat.id)}
                style={selectedCategoryId !== cat.id ? { borderColor: cat.color + '40', color: cat.color } : { backgroundColor: cat.color }}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredProducts.map(product => {
                const isLow = product.stock <= (product.minStock || 5);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative flex flex-col text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all active:scale-[0.98] border-b-4 border-b-slate-100"
                  >
                    <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-200" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-blue-600 font-black text-sm">₱{product.price}</span>
                        <Badge variant={isLow ? "destructive" : "secondary"} className="h-5 px-1.5 text-[10px] font-bold">
                          {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        <aside className={cn(
          "fixed inset-y-0 right-0 z-40 w-full sm:w-[380px] bg-white border-l shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none",
          isOrderPanelOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          "flex flex-col h-full"
        )}>
          <div className="h-16 border-b flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h2 className="font-black text-sm uppercase tracking-wider">Cart ({cart.reduce((acc, i) => acc + i.quantity, 0)})</h2>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOrderPanelOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="h-12 w-12 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">{item.name}</div>
                  <div className="text-blue-600 font-black text-xs">₱{item.price}</div>
                </div>
                <div className="flex items-center gap-2 bg-white border rounded-xl p-1 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="font-black text-sm min-w-[20px] text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-slate-50/50 space-y-4">
            <div className="space-y-2 text-xs font-bold text-slate-500 uppercase">
              <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>VAT (12%)</span><span>₱{tax.toLocaleString()}</span></div>
              <div className="flex justify-between pt-3 border-t text-lg font-black text-slate-900">
                <span>TOTAL</span>
                <span className="text-blue-600">₱{totalDue.toLocaleString()}</span>
              </div>
            </div>
            <Button 
              className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-200 disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              CHECKOUT
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-widest">Select Payment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("CASH")}>
              <div className="flex items-center gap-4"><span>💵</span> CASH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("QR_PH")}>
              <div className="flex items-center gap-4"><span>📱</span> QR PH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("MAYA_TERMINAL")}>
              <div className="flex items-center gap-4"><span>💳</span> MAYA CARD</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lastSale} onOpenChange={() => setLastSale(null)}>
        <DialogContent className="sm:max-w-[320px] p-8 text-center rounded-3xl">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">Success</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">{lastSale?.orderNo}</p>
          <Button className="w-full h-12 font-black rounded-xl bg-slate-900" onClick={() => setLastSale(null)}>NEW ORDER</Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>
    </div>
  );
}