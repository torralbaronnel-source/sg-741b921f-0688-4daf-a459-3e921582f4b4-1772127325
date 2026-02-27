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
  Image as ImageIcon,
  Receipt
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, INITIAL_SETTINGS } from "@/lib/mock-data";
import { Product, CartItem, Sale, PaymentMethod, AppSettings, Category } from "@/types/pos";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalDue = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const subtotal = useMemo(() => totalDue / (1 + (settings?.vatRate || 0) / 100), [totalDue, settings?.vatRate]);
  const tax = useMemo(() => totalDue - subtotal, [totalDue, subtotal]);

  // Load Master Data from Inventory Studio
  useEffect(() => {
    const savedProducts = localStorage.getItem("pocketpos_products");
    const savedCategories = localStorage.getItem("pocketpos_categories");
    const savedSettings = localStorage.getItem("pocketpos_settings");
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(MOCK_PRODUCTS);
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(MOCK_CATEGORIES);
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(INITIAL_SETTINGS);
    }
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

  const handleCheckout = (paymentMethod: PaymentMethod) => {
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem("pocketpos_products", JSON.stringify(updatedProducts));

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      orderNo: `OR-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      totalDue,
      subtotal,
      tax,
      total: totalDue,
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "PAID"
    };

    const existingSales = JSON.parse(localStorage.getItem("pocketpos_sales") || "[]");
    localStorage.setItem("pocketpos_sales", JSON.stringify([sale, ...existingSales]));
    
    setLastSale(sale);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // Improved Product Image/Emoji Rendering
  const renderProductImage = (product: Product) => {
    const displayImage = product.image || product.imageUrl;
    const category = categories.find(c => c.id === product.categoryId);
    const categoryColor = category?.color || "#cbd5e1";
    const categoryEmoji = "📦"; // Default placeholder

    if (displayImage) {
      return (
        <div className="relative w-full h-full">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-100 text-2xl">📦</div>';
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className="w-full h-full flex items-center justify-center text-3xl transition-colors duration-300"
        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
      >
        {categoryEmoji}
      </div>
    );
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
            {categories.map(cat => (
              <Button 
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                size="sm"
                className="rounded-full shrink-0 h-9 px-5 gap-2"
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredProducts.map(product => {
                const isLow = product.stock <= (product.minStock || 5);
                const category = categories.find(c => c.id === product.categoryId);
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={cn(
                      "group bg-white rounded-2xl border border-slate-200 p-3 transition-all hover:shadow-lg hover:border-blue-200 cursor-pointer active:scale-95 flex flex-col relative overflow-hidden",
                      product.stock <= 0 && "opacity-50 grayscale pointer-events-none"
                    )}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: category?.color }} />
                    <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden rounded-xl">
                      {renderProductImage(product)}
                    </div>
                    <div className="p-2">
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600 font-black text-xs">₱{product.price}</span>
                        <Badge variant={isLow ? "destructive" : "secondary"} className="h-4 px-1 text-[9px] font-bold">
                          {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
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
                <div className="h-10 w-10 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                  {renderProductImage(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                  <div className="text-blue-600 font-black text-[10px]">₱{item.price}</div>
                </div>
                <div className="flex items-center gap-2 bg-white border rounded-xl p-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-2 w-2" /></Button>
                  <span className="font-black text-xs min-w-[15px] text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-2 w-2" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-slate-50/50 space-y-3">
            <div className="space-y-1.5 text-[10px] font-bold text-slate-500 uppercase">
              <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>VAT ({settings?.vatRate || 0}%)</span><span>₱{tax.toFixed(2)}</span></div>
              <div className="flex justify-between pt-2 border-t text-base font-black text-slate-900">
                <span>TOTAL</span>
                <span className="text-blue-600">₱{totalDue.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-base shadow-xl disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              PAY NOW
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-widest text-center">Payment Method</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button variant="outline" className="h-14 justify-between px-6 text-base font-black border-2 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("CASH")}>
              <div className="flex items-center gap-4"><span>💵</span> CASH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-14 justify-between px-6 text-base font-black border-2 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("QR_PH")}>
              <div className="flex items-center gap-4"><span>📱</span> QR PH</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
            <Button variant="outline" className="h-14 justify-between px-6 text-base font-black border-2 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all" onClick={() => handleCheckout("MAYA_TERMINAL")}>
              <div className="flex items-center gap-4"><span>💳</span> MAYA CARD</div>
              <ChevronRight className="w-5 h-5 opacity-30" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lastSale} onOpenChange={() => setLastSale(null)}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-white p-6 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            {lastSale && (
              <div className="receipt-container bg-slate-50 p-6 rounded-xl border border-slate-200 font-mono shadow-inner">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="font-black text-base uppercase tracking-tight">{settings?.shopName}</h3>
                  <p className="text-[9px] text-slate-500 uppercase leading-tight">{settings?.address}</p>
                  <div className="flex justify-center gap-4 text-[9px] text-slate-500 mt-1">
                    <span>TIN: {settings?.tin}</span>
                    <span>TEL: {settings?.phone}</span>
                  </div>
                  <div className="border-y border-dashed border-slate-300 py-1 my-3">
                    <p className="text-[10px] font-black uppercase">Official Receipt</p>
                  </div>
                </div>

                <div className="space-y-0.5 mb-4 text-[9px] font-bold">
                  <div className="flex justify-between"><span>RECEIPT NO:</span><span>{lastSale.orderNo}</span></div>
                  <div className="flex justify-between"><span>DATE:</span><span>{new Date(lastSale.timestamp).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>TIME:</span><span>{new Date(lastSale.timestamp).toLocaleTimeString()}</span></div>
                  <div className="flex justify-between"><span>CASHIER:</span><span>ADMIN</span></div>
                </div>

                <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-[9px] font-black border-b border-dashed border-slate-300 pb-1 uppercase">
                    <span className="w-6">QTY</span>
                    <span className="flex-1 px-2">ITEM</span>
                    <span className="w-16 text-right">TOTAL</span>
                  </div>
                  {lastSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[9px] leading-tight font-medium">
                      <span className="w-6">{item.quantity}</span>
                      <span className="flex-1 px-2 truncate">{item.name}</span>
                      <span className="w-16 text-right">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300 pt-3 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-500">VATABLE SALES</span>
                    <span>₱{lastSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-500">VAT AMOUNT ({settings?.vatRate || 12}%)</span>
                    <span>₱{lastSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 text-slate-900">
                    <span>TOTAL DUE</span>
                    <span>₱{lastSale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black pt-1 border-t border-slate-200 mt-2">
                    <span className="uppercase">{lastSale.paymentMethod}</span>
                    <span>₱{lastSale.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 text-center space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest">THANK YOU FOR YOUR PATRONAGE</p>
                  <p className="text-[7px] text-slate-300 font-bold uppercase tracking-widest">Powered by PocketPOS PH</p>
                </div>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 font-black rounded-xl border-slate-200" onClick={() => window.print()}>
                PRINT
              </Button>
              <Button className="h-12 font-black rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => setLastSale(null)}>
                NEW ORDER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm; 
            background: white !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}