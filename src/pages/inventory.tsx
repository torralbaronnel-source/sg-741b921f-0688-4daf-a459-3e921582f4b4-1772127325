import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Package, 
  History, 
  ArrowLeft, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Tags,
  RefreshCw,
  X,
  ChevronRight,
  AlertTriangle,
  Palette,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MOCK_PRODUCTS, 
  MOCK_CATEGORIES 
} from "@/lib/mock-data";
import { Product, Category } from "@/types/pos";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"list" | "categories" | "logs">("list");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Product Sheet State
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Category Sheet State
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Stats
  const stats = useMemo(() => {
    const totalItems = products.length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const lowStockItems = products.filter(p => p.stock < 10).length;
    return { totalItems, inventoryValue, lowStockItems };
  }, [products]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSKU = () => {
    return "SKU-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const catId = formData.get("categoryId") as string;
    const catName = categories.find(c => c.id === catId)?.name || "Uncategorized";

    const productData: Partial<Product> = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      price: Number(formData.get("price")),
      cost: Number(formData.get("cost")),
      categoryId: catId,
      category: catName,
      stock: Number(formData.get("stock")),
      emoji: formData.get("emoji") as string,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } as Product : p));
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...productData as Product,
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsProductSheetOpen(false);
  };

  const handleSaveCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryData: Partial<Category> = {
      name: formData.get("name") as string,
      emoji: formData.get("emoji") as string,
      color: formData.get("color") as string,
    };

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...categoryData } as Category : c));
      // Update existing products with new category name if it changed
      setProducts(prev => prev.map(p => p.categoryId === editingCategory.id ? { ...p, category: categoryData.name! } : p));
    } else {
      const newCategory: Category = {
        id: `cat-${Math.random().toString(36).substr(2, 5)}`,
        ...categoryData as Category,
        itemCount: 0
      };
      setCategories(prev => [newCategory, ...prev]);
    }
    setIsCategorySheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "list" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-600"
            )}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Products</span>
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "categories" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-600"
            )}
          >
            <Tags className="w-4 h-4" />
            <span className="hidden sm:inline">Categories</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full space-y-6">
        {/* Simple Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Items</p>
              <p className="text-2xl font-black text-slate-900">{stats.totalItems}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Inventory Value</p>
              <p className="text-2xl font-black text-slate-900">₱{stats.inventoryValue.toLocaleString()}</p>
            </div>
          </div>
          <div className={cn(
            "p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors",
            stats.lowStockItems > 0 ? "bg-red-50 border-red-100" : "bg-white border-slate-200"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              stats.lowStockItems > 0 ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-400"
            )}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("text-xs font-bold uppercase", stats.lowStockItems > 0 ? "text-red-400" : "text-slate-400")}>Low Stock</p>
              <p className={cn("text-2xl font-black", stats.lowStockItems > 0 ? "text-red-700" : "text-slate-900")}>{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search name or SKU..." 
                  className="pl-10 h-11 bg-white border-slate-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => { setEditingProduct(null); setIsProductSheetOpen(true); }}
                className="w-full sm:w-auto h-11 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl gap-2 font-bold"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shadow-inner border border-slate-200">
                            {product.emoji || "📦"}
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-tight">{product.sku || "NO-SKU"}</div>
                            <div className="font-bold text-slate-900 leading-none">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-bold bg-slate-50 border-slate-200 text-slate-500 rounded-lg px-2 py-0.5">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">₱{product.cost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">₱{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-black",
                            product.stock < 10 ? "text-red-600" : "text-slate-900"
                          )}>{product.stock}</span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                product.stock < 10 ? "bg-red-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">
                        ₱{(product.stock * product.cost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsProductSheetOpen(true); }} className="gap-2 font-bold">
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setProducts(prev => prev.filter(p => p.id !== product.id))} className="gap-2 text-red-600 font-bold">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Category Studio</h2>
              <Button 
                onClick={() => { setEditingCategory(null); setIsCategorySheetOpen(true); }}
                className="h-10 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl gap-2 font-bold shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                New Category
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div 
                    className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 opacity-5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}
                      >
                        {cat.emoji}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">{cat.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{products.filter(p => p.categoryId === cat.id).length} Products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setIsCategorySheetOpen(true); }} className="h-8 w-8 rounded-lg">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))} className="h-8 w-8 rounded-lg hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Drawer */}
      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white border-l border-slate-200 p-0 overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <SheetHeader>
                <SheetTitle className="text-xl font-black text-slate-900 uppercase tracking-widest">
                  {editingProduct ? "Edit Product" : "New Product"}
                </SheetTitle>
                <SheetDescription className="font-bold text-slate-500">Configure your listing details below</SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Icon</label>
                  <Input name="emoji" defaultValue={editingProduct?.emoji || "📦"} className="text-center text-2xl h-12 bg-slate-50 border-slate-200 rounded-xl" />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Product Name</label>
                  <Input name="name" required defaultValue={editingProduct?.name} placeholder="e.g. Arabica Roast" className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Category</label>
                <select 
                  name="categoryId" 
                  defaultValue={editingProduct?.categoryId}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">SKU / BARCODE</label>
                <div className="relative">
                  <Input name="sku" defaultValue={editingProduct?.sku} placeholder="Auto-generated" className="h-12 bg-slate-50 border-slate-200 rounded-xl font-mono uppercase font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Cost (PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                    <Input name="cost" required type="number" step="0.01" defaultValue={editingProduct?.cost} className="pl-8 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-slate-600" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Price (PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                    <Input name="price" required type="number" step="0.01" defaultValue={editingProduct?.price} className="pl-8 h-12 bg-slate-50 border-slate-200 rounded-xl font-black text-blue-600" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Initial Stock</label>
                <Input name="stock" required type="number" defaultValue={editingProduct?.stock || 0} className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsProductSheetOpen(false)} className="flex-1 rounded-xl h-12 border-slate-200 font-bold">
                Cancel
              </Button>
              <Button type="submit" className="flex-[2] rounded-xl h-12 bg-[#2563EB] hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                {editingProduct ? "UPDATE PRODUCT" : "SAVE PRODUCT"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Category Drawer */}
      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white border-l border-slate-200 p-0 overflow-y-auto">
          <form onSubmit={handleSaveCategory} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <SheetHeader>
                <SheetTitle className="text-xl font-black text-slate-900 uppercase tracking-widest">
                  {editingCategory ? "Edit Category" : "New Category"}
                </SheetTitle>
                <SheetDescription className="font-bold text-slate-500">Visual hotkey for your POS terminal</SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 p-6 space-y-8">
              <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Emoji</label>
                  <Input name="emoji" required defaultValue={editingCategory?.emoji || "📁"} className="text-center text-3xl h-16 bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Category Name</label>
                  <Input name="name" required defaultValue={editingCategory?.name} placeholder="e.g. Signature Lattes" className="h-16 bg-slate-50 border-slate-200 rounded-2xl text-lg font-black uppercase" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Brand Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {["#2563EB", "#7C2D12", "#166534", "#92400E", "#7E22CE", "#BE123C", "#0F172A", "#F59E0B"].map(color => (
                    <label key={color} className="relative cursor-pointer">
                      <input 
                        type="radio" 
                        name="color" 
                        value={color} 
                        className="peer sr-only" 
                        defaultChecked={editingCategory?.color === color || (!editingCategory && color === "#2563EB")} 
                      />
                      <div 
                        className="w-full aspect-square rounded-xl border-4 border-transparent peer-checked:border-white shadow-sm ring-1 ring-slate-200 peer-checked:ring-2 peer-checked:ring-slate-900 transition-all"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCategorySheetOpen(false)} className="flex-1 rounded-xl h-12 border-slate-200 font-bold">
                Cancel
              </Button>
              <Button type="submit" className="flex-[2] rounded-xl h-12 bg-[#0F172A] hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-900/20">
                {editingCategory ? "UPDATE CATEGORY" : "SAVE CATEGORY"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}