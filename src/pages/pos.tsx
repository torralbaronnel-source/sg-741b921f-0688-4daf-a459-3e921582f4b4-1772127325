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
  Zap
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { MOCK_PRODUCTS, INITIAL_SETTINGS } from "@/lib/mock-data";
import { Product, CartItem, Sale, PaymentMethod, AppSettings } from "@/types/pos";
import { cn } from "@/lib/utils";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [settings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  
  // High-Speed Qty Pad State
  const [activeQtyItem, setActiveQtyItem] = useState<CartItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Financials
  const totalDue = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const subtotal = useMemo(() => totalDue / 1.12, [totalDue]);
  const tax = useMemo(() => totalDue - subtotal, [totalDue, subtotal]);

  // Keyboard Shortcuts
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
      if (e.key === "Enter" && cart.length > 0 && !isCheckoutOpen) {
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, isCheckoutOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

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
    setSearchQuery("");
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

  const setExactQuantity = (id: string, qty: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    ).filter(item => item.quantity > 0));
    setActiveQtyItem(null);
  };

  const handleCheckout = (method: PaymentMethod) => {
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      orderNo: `ORD-${Math.floor(Math.random() * 10000)}`,
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
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <SEO title="Terminal | PocketPOS" />
      
      {/* Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline-block">PocketPOS</span>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              ref={searchInputRef}
              placeholder="Search products..." 
              className="pl-9 bg-slate-100 border-none h-9 focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative md:hidden" onClick={() => setIsOrderPanelOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Button>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
            JD
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MAIN PRODUCT GRID */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b bg-slate-50/50">
            <Button 
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Button>
            {(settings?.categories || []).map(cat => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative flex flex-col text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="aspect-square bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    {product.emoji || "📦"}
                  </div>
                  <div className="p-2">
                    <div className="font-semibold text-xs text-slate-900 line-clamp-1">{product.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-blue-600 font-bold text-sm">₱{product.price}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.stock <= (product.lowStockThreshold || 5) ? 'bg-red-100 text-red-600 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                        {product.stock}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* MOBILE STICKY BAR */}
          <div className="md:hidden p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Total Due</span>
              <span className="text-lg font-bold text-blue-600">₱{totalDue.toLocaleString()}</span>
            </div>
            <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex-1" onClick={() => setIsOrderPanelOpen(true)}>
              Checkout ({cart.reduce((acc, item) => acc + item.quantity, 0)})
            </Button>
          </div>
        </main>

        {/* ORDER SIDEBAR / DRAWER */}
        <aside className={cn(
          "fixed inset-y-0 right-0 z-40 w-full sm:w-[380px] bg-white border-l shadow-2xl transition-transform duration-300 ease-in-out transform md:relative md:translate-x-0 md:shadow-none md:z-auto",
          isOrderPanelOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          "flex flex-col h-full"
        )}>
          <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-sm">CURRENT ORDER</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setIsOrderPanelOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <Plus className="h-8 w-8 mb-2" />
                <p className="text-xs font-medium">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">{item.name}</div>
                      <div className="text-blue-600 font-bold text-xs">₱{item.price}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <button className="px-2 py-1 font-bold text-xs min-w-[24px]" onClick={() => setActiveQtyItem(item)}>
                        {item.quantity}
                      </button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-slate-50/50 space-y-4">
            <div className="space-y-1.5 text-xs font-medium text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>VAT (12%)</span><span>₱{tax.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t text-base font-bold text-slate-900">
                <span>TOTAL</span>
                <span className="text-blue-600">₱{totalDue.toLocaleString()}</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              PAYMENT (₱{totalDue.toLocaleString()})
            </Button>
          </div>
        </aside>
      </div>

      {/* Qty Pad Dialog */}
      <Dialog open={!!activeQtyItem} onOpenChange={() => setActiveQtyItem(null)}>
        <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden rounded-3xl">
          <div className="p-6 bg-slate-900 text-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Set Quantity</p>
            <h3 className="text-base font-black truncate">{activeQtyItem?.name}</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2 bg-white">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((val) => (
              <Button
                key={val}
                variant={val === '✓' ? "default" : "outline"}
                className={cn(
                  "h-12 text-lg font-black rounded-xl",
                  val === '✓' ? "bg-blue-600" : val === 'C' ? "text-red-500" : "text-slate-900"
                )}
                onClick={() => {
                  if (val === '✓') setActiveQtyItem(null);
                  else if (val === 'C') setExactQuantity(activeQtyItem!.id, 0);
                  else if (typeof val === 'number') setExactQuantity(activeQtyItem!.id, val);
                }}
              >
                {val}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-black">PAYMENT METHOD</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl" onClick={() => handleCheckout("CASH")}>
              <div className="flex items-center gap-3"><span>💵</span>CASH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl" onClick={() => handleCheckout("QR_PH")}>
              <div className="flex items-center gap-3"><span>📱</span>QR PH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-16 justify-between px-6 text-lg font-black border-2 rounded-2xl" onClick={() => handleCheckout("MAYA_TERMINAL")}>
              <div className="flex items-center gap-3"><span>💳</span>MAYA CARD</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={!!lastSale} onOpenChange={() => setLastSale(null)}>
        <DialogContent className="sm:max-w-[320px] p-8 text-center rounded-3xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-1">PAID SUCCESS</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">{lastSale?.orderNo}</p>
          <Button className="w-full h-12 font-black rounded-xl bg-slate-900" onClick={() => setLastSale(null)}>NEW ORDER</Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>
    </div>
  );
}