import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { SidebarLayout } from "@/components/SidebarLayout";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  CreditCard, 
  Banknote, 
  ChevronRight,
  ChevronLeft,
  LayoutGrid
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { transactionService } from "@/services/transactionService";
import type { Product, Category, CartItem } from "@/types/pos";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadData();
    const productSub = productService.subscribeToProducts(() => loadData());
    const categorySub = productService.subscribeToCategories(() => loadData());

    return () => {
      productSub.unsubscribe();
      categorySub.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(pData as any); // Cast temporarily to satisfy current type mismatches if any
      setCategories(cData);
    } catch (error) {
      console.error("Error loading POS data:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    if (!showCart && typeof window !== "undefined" && window.innerWidth < 1024) {
      setShowCart(true);
    }
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

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      // Get next order number from DB
      const { data: orderNoData } = await supabase.rpc('get_next_order_number', { p_shop_id: 'default-shop' });
      const orderNo = orderNoData || `ORD-${Date.now().toString().slice(-6)}`;

      const itemsJson = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const transaction = {
        shop_id: "default-shop",
        total: subtotal,
        payment_method: paymentMethod,
        items: itemsJson as any,
        order_no: orderNo
      };

      const result = await transactionService.createTransaction(transaction);
      
      if (result) {
        setCart([]);
        router.push(`/receipt/${result.id}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing the transaction.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SidebarLayout>
      <SEO title="POS Terminal | PocketPOS PH" />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
        <div className={`flex-1 flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 h-11 bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-11 w-11 flex shrink-0"
                onClick={() => setShowCart(!showCart)}
              >
                {showCart ? <ChevronRight className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5 text-blue-600" />}
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Button 
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4 shrink-0"
                onClick={() => setSelectedCategory("all")}
              >
                All Items
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4 shrink-0"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                >
                  <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-slate-200 group h-full flex flex-col">
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <LayoutGrid className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-blue-600 font-bold mt-auto">₱{product.price.toLocaleString()}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCart && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-[400px] border-l bg-white flex flex-col absolute inset-0 lg:relative z-20 shadow-2xl lg:shadow-none"
            >
              <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-lg">Current Order</h2>
                  <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-600">{cart.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-lg bg-white border overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <LayoutGrid className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-sm truncate">{item.name}</h4>
                        <p className="text-slate-500 text-xs">₱{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500 h-8 w-8"
                        onClick={() => updateQuantity(item.id, -item.quantity)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-600">Total</span>
                  <span className="text-blue-600 text-2xl">₱{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="h-14 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
                    onClick={() => handleCheckout("Cash")}
                    disabled={cart.length === 0 || isCheckingOut}
                  >
                    <Banknote className="w-5 h-5 mr-2" />
                    Cash
                  </Button>
                  <Button 
                    className="h-14 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={() => handleCheckout("Digital")}
                    disabled={cart.length === 0 || isCheckingOut}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Digital
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-11 rounded-xl text-slate-500"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0 || isCheckingOut}
                >
                  Clear Order
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCart && cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden"
          >
            <Button 
              className="h-14 px-8 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 border-4 border-white font-bold flex gap-4 items-center"
              onClick={() => setShowCart(true)}
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <Badge className="absolute -top-3 -right-3 h-6 w-6 rounded-full flex items-center justify-center p-0 bg-red-500 border-2 border-white">
                  {cart.length}
                </Badge>
              </div>
              <span className="text-lg">₱{subtotal.toLocaleString()}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </SidebarLayout>
  );
}