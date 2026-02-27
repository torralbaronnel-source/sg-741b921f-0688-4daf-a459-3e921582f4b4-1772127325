import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, Search, X, Plus, Minus, Check, 
  CreditCard, Banknote, QrCode, Smartphone,
  Package, Trash2, Printer
} from "lucide-react";
import { productService, type Product, type Category } from "@/services/productService";
import { transactionService } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const { toast } = useToast();

  // Load live data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, c] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ]);
        setProducts(p);
        setCategories(c);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();

    const productSub = productService.subscribeToProducts(() => fetchData());
    const categorySub = productService.subscribeToCategories(() => fetchData());

    return () => {
      productSub.unsubscribe();
      categorySub.unsubscribe();
    };
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ variant: "destructive", title: "Out of stock" });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ variant: "destructive", title: "Stock limit reached" });
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > item.stock) {
          toast({ variant: "destructive", title: "Stock limit reached" });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // No tax/discount for MVP

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const orderNo = `ORD-${Date.now().toString().slice(-6)}`;
      
      // Map cart items to simple JSON structure for database
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const transaction = {
        order_no: orderNo,
        items: orderItems as any, // Cast to any for JSONB compatibility in SDK
        total,
        payment_method: paymentMethod,
        status: "PAID",
        customer_name: "Walk-in Customer",
        shop_id: "default-shop-id" // Placeholder for multi-tenant logic
      };

      const result = await transactionService.createTransaction(transaction);
      
      // Update stock levels
      await Promise.all(cart.map(item => 
        productService.upsertProduct({
          ...item,
          stock: item.stock - item.quantity
        })
      ));

      setLastTransaction(result);
      setCart([]);
      setShowReceipt(true);
      toast({ title: "Checkout Successful", description: `Order ${orderNo} has been paid.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Transaction Failed", description: "Could not save sale." });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (showReceipt && lastTransaction) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
          <Card className="w-full max-w-md rounded-3xl border-none shadow-2xl bg-white overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Payment Success!</h2>
              <p className="opacity-90 mt-1">Transaction Completed</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Order ID</span>
                <span className="font-mono font-medium text-slate-900">{lastTransaction.order_no}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-6 space-y-4">
                {lastTransaction.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">x{item.quantity} @ ₱{item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span>₱{lastTransaction.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-center text-slate-400 mt-4 uppercase tracking-widest">
                  Via {lastTransaction.payment_method} • {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="rounded-2xl h-14" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button className="rounded-2xl h-14 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowReceipt(false)}>
                  New Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <SEO title="POS Terminal - PocketPOS PH" />
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
          {/* Main POS Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
            {/* Top Bar */}
            <div className="p-4 bg-white border-b border-slate-200/60 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  className="pl-11 h-14 rounded-2xl bg-slate-50 border-none text-lg placeholder:text-slate-400" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <Button 
                  variant={selectedCategory === "all" ? "default" : "outline"} 
                  className="rounded-xl px-6 h-10 shrink-0"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Items
                </Button>
                {categories.map(cat => (
                  <Button 
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"} 
                    className="rounded-xl px-6 h-10 shrink-0"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.emoji} {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={cn(
                    "group rounded-3xl border-none shadow-sm cursor-pointer transition-all active:scale-95 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden flex flex-col",
                    product.stock <= 0 && "opacity-50 grayscale"
                  )}
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square relative bg-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-50">
                        {categories.find(c => c.id === product.category_id)?.emoji || "📦"}
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-white/80 backdrop-blur-md text-slate-900 border-none rounded-lg">
                      ₱{product.price.toFixed(0)}
                    </Badge>
                  </div>
                  <CardContent className="p-3 bg-white">
                    <p className="font-semibold text-slate-800 line-clamp-2 leading-tight h-10 mb-1">{product.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        {product.stock} left
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Panel (Sidebar) */}
          <div className="w-full md:w-[400px] bg-white border-l border-slate-200/60 flex flex-col shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Current Cart</h3>
                  <p className="text-xs text-slate-400 font-medium">{cart.length} items selected</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl text-slate-400 hover:text-rose-600"
                onClick={() => setCart([])}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Package className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-medium">No items in cart</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 group hover:bg-slate-100 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : "☕"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-sm font-bold text-blue-600">₱{(item.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-md" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-md" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 text-rose-500" onClick={() => removeFromCart(item.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-slate-900">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="rounded-2xl h-16 bg-slate-900 hover:bg-black font-bold flex flex-col items-center justify-center gap-1 shadow-xl"
                  onClick={() => handleCheckout("CASH")}
                  disabled={isProcessing || cart.length === 0}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">CASH</span>
                </Button>
                <Button 
                  className="rounded-2xl h-16 bg-blue-600 hover:bg-blue-700 font-bold flex flex-col items-center justify-center gap-1 shadow-xl shadow-blue-500/20"
                  onClick={() => handleCheckout("GCASH")}
                  disabled={isProcessing || cart.length === 0}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">GCASH</span>
                </Button>
                <Button 
                  className="rounded-2xl h-16 bg-emerald-600 hover:bg-emerald-700 font-bold flex flex-col items-center justify-center gap-1 shadow-xl shadow-emerald-500/20"
                  onClick={() => handleCheckout("MAYA")}
                  disabled={isProcessing || cart.length === 0}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">MAYA</span>
                </Button>
                <Button 
                  className="rounded-2xl h-16 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold flex flex-col items-center justify-center gap-1"
                  onClick={() => handleCheckout("CARD")}
                  disabled={isProcessing || cart.length === 0}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">CARD</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}