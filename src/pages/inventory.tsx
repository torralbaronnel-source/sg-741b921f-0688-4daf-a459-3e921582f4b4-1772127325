import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, ArrowLeft, Package, 
  TrendingUp, AlertTriangle, MoreVertical, Edit, 
  Trash2, Image as ImageIcon, Check, RefreshCw,
  Layers, ChevronRight, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Product, Category } from "@/types/pos";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "logs">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    price: 0,
    cost: 0,
    stock: 0,
    categoryId: "cat-1",
    image: "",
    minStock: 10
  });

  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    name: "",
    color: "#2563EB",
    image: ""
  });

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const stats = useMemo(() => {
    const totalItems = MOCK_PRODUCTS.length;
    const inventoryValue = MOCK_PRODUCTS.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const lowStockCount = MOCK_PRODUCTS.filter(p => p.stock <= (p.minStock || 10)).length;
    const potentialRevenue = MOCK_PRODUCTS.reduce((acc, p) => acc + (p.stock * p.price), 0);
    
    return { totalItems, inventoryValue, lowStockCount, potentialRevenue };
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsProductDrawerOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      price: 0,
      cost: 0,
      stock: 0,
      categoryId: MOCK_CATEGORIES[0]?.id || "",
      image: "",
      minStock: 10
    });
    setIsProductDrawerOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData(cat);
    setIsCategoryDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Inventory Terminal</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Asset Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <Button 
              variant={activeTab === "products" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full gap-2 shrink-0"
              onClick={() => setActiveTab("products")}
            >
              <Package className="w-4 h-4" /> Products
            </Button>
            <Button 
              variant={activeTab === "categories" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full gap-2 shrink-0"
              onClick={() => setActiveTab("categories")}
            >
              <Layers className="w-4 h-4" /> Categories
            </Button>
            <Button 
              variant={activeTab === "logs" ? "default" : "outline"} 
              size="sm" 
              className="rounded-full gap-2 shrink-0"
              onClick={() => setActiveTab("logs")}
            >
              <RefreshCw className="w-4 h-4" /> Movement Logs
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Insights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
            <p className="text-2xl font-black text-slate-900">₱{stats.inventoryValue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">At Purchase Cost</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Low Stock</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-black ${stats.lowStockCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
                {stats.lowStockCount}
              </p>
              {stats.lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase italic">Needs Attention</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hidden lg:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalItems}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase italic">SKU Count</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hidden lg:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Potential Sales</p>
            <p className="text-2xl font-black text-emerald-600">₱{stats.potentialRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase italic">Est. Gross Value</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search SKU or Name..." 
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-11 rounded-xl gap-2 border-slate-200 bg-white">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button 
              className="flex-1 md:flex-none h-11 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800"
              onClick={activeTab === "products" ? handleAddProduct : () => setIsCategoryDrawerOpen(true)}
            >
              <Plus className="w-5 h-5" /> 
              {activeTab === "products" ? "Add Product" : "New Category"}
            </Button>
          </div>
        </div>

        {/* Product Table */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Info</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finances</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48">Stock Level</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const isLow = product.stock <= (product.minStock || 10);
                    const margin = ((product.price - product.cost) / product.price * 100).toFixed(0);
                    const category = MOCK_CATEGORIES.find(c => c.id === product.categoryId);

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center relative">
                              {product.image ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                              )}
                              {isLow && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full translate-x-1 -translate-y-1 shadow-sm" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-none mb-1.5">{product.name}</p>
                              <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tight">
                                {product.sku}
                              </code>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge 
                            variant="outline" 
                            className="rounded-full font-medium" 
                            style={{ borderColor: category?.color + '40', color: category?.color }}
                          >
                            {category?.name || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">₱{product.price}</span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">+{margin}%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Cost: ₱{product.cost}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className={`text-xs font-black ${isLow ? "text-rose-600" : "text-slate-900"}`}>
                                {product.stock} units
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                Value: ₱{(product.stock * product.cost).toLocaleString()}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((product.stock / 100) * 100, 100)} 
                              className={`h-1.5 rounded-full ${isLow ? "[&>div]:bg-rose-500" : "[&>div]:bg-emerald-500"}`}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="group-hover:hidden">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-300">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Grid */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CATEGORIES.map(category => (
              <div key={category.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-2 h-full" 
                  style={{ backgroundColor: category.color }} 
                />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img src={category.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full" style={{ backgroundColor: category.color + '20' }} />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{category.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {MOCK_PRODUCTS.filter(p => p.categoryId === category.id).length} Products
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{category.color}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 rounded-lg h-8">
                    View Products <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Movement Logs - High Speed Placeholder */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Audit Logs Incoming</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We're preparing a real-time ledger for stock-in, waste, and automated sales adjustments.
            </p>
            <Button className="rounded-full bg-slate-900">Enable Advanced Tracking</Button>
          </div>
        )}
      </main>

      {/* Product Drawer */}
      <Sheet open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-black">{editingProduct ? "Edit Product" : "New Product"}</SheetTitle>
            <SheetDescription>Set pricing, SKU, and stock levels.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Asset (URL)</label>
              <div className="relative">
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  className="bg-slate-50 border-slate-200 rounded-xl pr-10"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
                <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
              <div className="mt-2 w-full h-32 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-slate-400">Preview image here</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Name</label>
                <Input 
                  placeholder="e.g. Arabica Roast" 
                  className="bg-slate-50 border-slate-200 rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU Code</label>
                <div className="relative">
                  <Input 
                    placeholder="PROD-000" 
                    className="bg-slate-100 border-slate-200 rounded-xl font-mono"
                    value={formData.sku}
                    readOnly
                  />
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost Price (₱)</label>
                <Input 
                  type="number" 
                  className="bg-white border-slate-200 rounded-xl font-bold"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selling Price (₱)</label>
                <Input 
                  type="number" 
                  className="bg-white border-slate-200 rounded-xl font-bold text-blue-600"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Margin</span>
                <span className="text-sm font-black text-emerald-600">
                  {formData.price && formData.cost ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(1) : "0"}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Stock</label>
                <Input 
                  type="number" 
                  className="bg-slate-50 border-slate-200 rounded-xl"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alert</label>
                <Input 
                  type="number" 
                  className="bg-slate-50 border-slate-200 rounded-xl text-rose-600"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-10 pt-6 border-t border-slate-100 flex-col gap-2">
            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">
              {editingProduct ? "Update Product" : "Save Product"}
            </Button>
            <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold" onClick={() => setIsProductDrawerOpen(false)}>
              Discard Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Category Drawer Placeholder */}
      <Sheet open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-black">{editingCategory ? "Edit Category" : "New Category"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
              <Input 
                placeholder="e.g. Breakfast" 
                className="bg-slate-50 border-slate-200 rounded-xl"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Color</label>
              <div className="flex gap-4 items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input 
                  type="color" 
                  className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({...categoryFormData, color: e.target.value})}
                />
                <span className="text-sm font-mono font-bold text-slate-600 uppercase tracking-wider">{categoryFormData.color}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cover Image URL</label>
              <Input 
                placeholder="https://..." 
                className="bg-slate-50 border-slate-200 rounded-xl"
                value={categoryFormData.image}
                onChange={(e) => setCategoryFormData({...categoryFormData, image: e.target.value})}
              />
            </div>
          </div>
          <SheetFooter className="mt-10 pt-6 border-t border-slate-100">
            <Button className="w-full h-12 rounded-xl bg-slate-900 font-bold">Save Category</Button>
          </SheetFooter>
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