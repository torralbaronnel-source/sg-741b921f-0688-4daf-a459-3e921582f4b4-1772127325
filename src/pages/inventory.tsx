import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  LayoutGrid,
  List,
  Image as ImageIcon,
  X,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Settings2
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Product, Category } from "@/types/pos";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// --- Validation Schemas ---

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters").regex(/^[a-zA-Z0-9-]+$/, "Alphanumeric only"),
  price: z.coerce.number().min(0.01, "Price must be positive"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  minStock: z.coerce.number().min(0, "Threshold cannot be negative"),
  categoryId: z.string().min(1, "Please select a category"),
  image: z.string().optional(),
}).refine(data => data.price >= data.cost, {
  message: "Selling price must be greater than or equal to cost",
  path: ["price"]
});

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().optional(),
  color: z.string().min(1, "Please select a color group"),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

const CATEGORY_COLORS = [
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-500" },
  { name: "Amber", value: "amber", bg: "bg-amber-500", text: "text-amber-500" },
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-500" },
  { name: "Rose", value: "rose", bg: "bg-rose-500", text: "text-rose-500" },
  { name: "Indigo", value: "indigo", bg: "bg-indigo-500", text: "text-indigo-500" },
  { name: "Emerald", value: "emerald", bg: "bg-emerald-500", text: "text-emerald-500" },
  { name: "Cyan", value: "cyan", bg: "bg-cyan-500", text: "text-cyan-500" },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "movements">("products");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer States
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Forms
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      categoryId: "",
      image: ""
    }
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      color: ""
    }
  });

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "product" | "category") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.filePath) {
        if (type === "product") {
          productForm.setValue("image", data.filePath);
        } else {
          categoryForm.setValue("image", data.filePath);
        }
        toast({ title: "Success", description: "Image uploaded successfully" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image" });
    } finally {
      setIsUploading(false);
    }
  };

  // --- Product Handlers ---
  const onSaveProduct = (data: ProductFormData) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      toast({ title: "Updated", description: "Product has been updated" });
    } else {
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: data.name,
        sku: data.sku,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        image: data.image,
      };
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "Created", description: "Product added to inventory" });
    }
    setIsProductDrawerOpen(false);
    setEditingProduct(null);
    productForm.reset();
  };

  const deleteProduct = async (id: string, imageUrl?: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      if (imageUrl && imageUrl.startsWith("/uploads/")) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: imageUrl }),
        });
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Product removed from inventory" });
    }
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const confirmDelete = () => {
    if (productToDelete && deleteConfirmText === productToDelete.name) {
      deleteProduct(productToDelete.id, productToDelete.image);
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      setDeleteConfirmText("");
    }
  };

  // --- Category Handlers ---
  const onSaveCategory = (data: CategoryFormData) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
      toast({ title: "Updated", description: "Category has been updated" });
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        image: data.image,
        color: data.color
      };
      setCategories(prev => [...prev, newCategory]);
      toast({ title: "Created", description: "New category added" });
    }
    setIsCategoryDrawerOpen(false);
    setEditingCategory(null);
    categoryForm.reset();
  };

  const deleteCategory = async (id: string, imageUrl?: string) => {
    const productsInCategory = products.filter(p => p.categoryId === id);
    if (productsInCategory.length > 0) {
      toast({ 
        variant: "destructive", 
        title: "Cannot Delete", 
        description: `This category has ${productsInCategory.length} products. Move them first.` 
      });
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      if (imageUrl && imageUrl.startsWith("/uploads/")) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: imageUrl }),
        });
      }
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: "Deleted", description: "Category removed" });
    }
  };

  // --- Derived Data ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
    const totalValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const potentialSales = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const lowStock = products.filter(p => p.stock <= (p.minStock || 5)).length;
    return { totalItems, totalValue, potentialSales, lowStock };
  }, [products]);

  const usedColors = useMemo(() => 
    categories.map(c => c.color).filter(Boolean) as string[], 
    [categories]
  );

  // Persistence Layer
  useEffect(() => {
    const savedProducts = localStorage.getItem("pocketpos_products");
    const savedCategories = localStorage.getItem("pocketpos_categories");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  // Master Sync to POS
  useEffect(() => {
    localStorage.setItem("pocketpos_products", JSON.stringify(products));
    localStorage.setItem("pocketpos_categories", JSON.stringify(categories));
  }, [products, categories]);

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 md:pb-0">
      <SEO title="Inventory | PocketPOS PH" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Terminal</h1>
              <p className="text-xs text-slate-500 font-medium">Manage assets & stock levels</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="hidden md:flex gap-2"
              onClick={() => {
                const csv = products.map(p => `${p.sku},${p.name},${p.stock},${p.price}`).join("\n");
                const blob = new Blob([`SKU,Name,Stock,Price\n${csv}`], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "inventory-report.csv";
                a.click();
              }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 flex-1 md:flex-none gap-2"
              onClick={() => {
                if (activeTab === "products") {
                  setEditingProduct(null);
                  productForm.reset({
                    name: "", sku: "", price: 0, cost: 0, stock: 0, minStock: 5, categoryId: "", image: ""
                  });
                  setIsProductDrawerOpen(true);
                } else {
                  setEditingCategory(null);
                  categoryForm.reset({ name: "", image: "", color: "" });
                  setIsCategoryDrawerOpen(true);
                }
              }}
            >
              <Plus className="w-4 h-4" />
              {activeTab === "products" ? "New Product" : "New Category"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Assets</p>
                  <h3 className="text-2xl font-black text-slate-900">₱{stats.totalValue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit">
                VALUE AT COST
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Low Stock</p>
                  <h3 className={`text-2xl font-black ${stats.lowStock > 0 ? "text-orange-500" : "text-green-500"}`}>
                    {stats.lowStock}
                  </h3>
                </div>
                <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", stats.lowStock > 0 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600")}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit uppercase">
                {stats.lowStock > 0 ? "Action Required" : "Stock Healthy"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Items</p>
                  <h3 className="text-2xl font-black text-slate-900">{stats.totalItems.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <List className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit">
                TOTAL UNITS
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Potential Sales</p>
                  <h3 className="text-2xl font-black text-slate-900">₱{stats.potentialSales.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full w-fit">
                TOTAL VALUE
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Control */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger value="products" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold px-6">Products</TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold px-6">Categories</TabsTrigger>
              <TabsTrigger value="movements" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold px-6">Stock-In Logs</TabsTrigger>
            </TabsList>

            {activeTab === "products" && (
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Search SKU or Name..." 
                  className="pl-10 bg-white border-slate-200 focus:ring-blue-500 transition-all rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          <TabsContent value="products">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Item & SKU</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Price / Cost</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Stock Level</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const stockPercentage = Math.min((product.stock / (product.minStock || 10)) * 100, 100);
                      const isLow = product.stock <= (product.minStock || 5);
                      const margin = product.price - product.cost;
                      const marginPercent = ((margin / product.price) * 100).toFixed(0);
                      const category = categories.find(c => c.id === product.categoryId);

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-400" />
                                )}
                                {isLow && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 border-2 border-white rounded-full animate-pulse" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "capitalize",
                              category?.color === "blue" && "bg-blue-50 text-blue-700 border-blue-200",
                              category?.color === "green" && "bg-green-50 text-green-700 border-green-200",
                              category?.color === "amber" && "bg-amber-50 text-amber-700 border-amber-200",
                              category?.color === "purple" && "bg-purple-50 text-purple-700 border-purple-200",
                              category?.color === "rose" && "bg-rose-50 text-rose-700 border-rose-200",
                              category?.color === "indigo" && "bg-indigo-50 text-indigo-700 border-indigo-200",
                              category?.color === "emerald" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                              category?.color === "cyan" && "bg-cyan-50 text-cyan-700 border-cyan-200"
                            )}>
                              {category?.name || "Uncategorized"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">₱{product.price.toLocaleString()}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-medium">Cost: ₱{product.cost}</span>
                                <span className="text-[10px] font-bold text-green-600">({marginPercent}%)</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[140px]">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex justify-between w-full text-[10px] font-bold">
                                <span className={isLow ? "text-orange-600" : "text-slate-600"}>{product.stock} units</span>
                                <span className="text-slate-400">min: {product.minStock || 5}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-500", isLow ? "bg-orange-500" : "bg-green-500")}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setEditingProduct(product);
                                  productForm.reset({
                                    name: product.name,
                                    sku: product.sku,
                                    price: product.price,
                                    cost: product.cost,
                                    stock: product.stock,
                                    minStock: product.minStock || 5,
                                    categoryId: product.categoryId || "",
                                    image: product.image || ""
                                  });
                                  setIsProductDrawerOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteProduct(product.id, product.image)}
                              >
                                <Trash2 className="w-4 h-4" />
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
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-black text-lg tracking-tight uppercase">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={cn("w-2 h-2 rounded-full", 
                          category.color === "blue" ? "bg-blue-400" :
                          category.color === "green" ? "bg-green-400" :
                          category.color === "amber" ? "bg-amber-400" :
                          category.color === "purple" ? "bg-purple-400" :
                          category.color === "rose" ? "bg-rose-400" :
                          category.color === "indigo" ? "bg-indigo-400" :
                          category.color === "emerald" ? "bg-emerald-400" :
                          category.color === "cyan" ? "bg-cyan-400" : "bg-slate-400"
                        )} />
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                          {products.filter(p => p.categoryId === category.id).length} Products
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 bg-white/90 backdrop-blur-md shadow-sm"
                        onClick={() => {
                          setEditingCategory(category);
                          categoryForm.reset({ 
                            name: category.name, 
                            image: category.image || "",
                            color: category.color || ""
                          });
                          setIsCategoryDrawerOpen(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 shadow-sm"
                        onClick={() => deleteCategory(category.id, category.image)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              <button 
                onClick={() => {
                  setEditingCategory(null);
                  categoryForm.reset({ name: "", image: "", color: "" });
                  setIsCategoryDrawerOpen(true);
                }}
                className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              >
                <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Create Category</span>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="movements">
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <RefreshCw className="w-10 h-10 text-slate-200 animate-spin-slow" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Stock-In Tracking</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">Coming soon: Automated inventory replenishment logs and supplier tracking.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Drawer */}
      <Sheet open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <SheetContent className="sm:max-w-md bg-white p-0 overflow-y-auto">
          <form onSubmit={productForm.handleSubmit(onSaveProduct)} className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b border-slate-100">
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {editingProduct ? "Edit Product" : "New Inventory Item"}
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500">
                Configure pricing, stock, and visuals.
              </SheetDescription>
            </SheetHeader>

            <div className="p-6 space-y-8 flex-1">
              {/* Image Section */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product Visual</Label>
                <div className="relative group w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-blue-300">
                  {productForm.watch("image") ? (
                    <>
                      <img src={productForm.watch("image")} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button type="button" variant="secondary" size="sm" className="font-bold" onClick={() => productForm.setValue("image", "")}>
                          Remove
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className={cn("w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:scale-110 transition-transform", isUploading && "animate-pulse")}>
                        {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900">Upload JPEG/PNG</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Max 5MB</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => handleImageUpload(e, "product")}
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </div>
                {productForm.formState.errors.image && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.image.message}</p>}
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Item Name</Label>
                  <Input 
                    {...productForm.register("name")}
                    placeholder="e.g. Premium Arabica Blend" 
                    className={cn("bg-slate-50 border-slate-200 h-12 font-bold", productForm.formState.errors.name && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {productForm.formState.errors.name && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">SKU / Code</Label>
                  <div className="relative">
                    <Input 
                      {...productForm.register("sku")}
                      placeholder="ITEM-001" 
                      className={cn("bg-slate-50 border-slate-200 h-12 font-mono text-sm uppercase", productForm.formState.errors.sku && "border-red-500 focus-visible:ring-red-500")}
                    />
                    <button 
                      type="button" 
                      onClick={() => productForm.setValue("sku", `POS-${Math.random().toString(36).substring(7).toUpperCase()}`)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {productForm.formState.errors.sku && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.sku.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</Label>
                  <Select 
                    onValueChange={(val) => productForm.setValue("categoryId", val)} 
                    value={productForm.watch("categoryId")}
                  >
                    <SelectTrigger className={cn("bg-slate-50 border-slate-200 h-12 font-bold", productForm.formState.errors.categoryId && "border-red-500")}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {productForm.formState.errors.categoryId && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.categoryId.message}</p>}
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pricing & Financials</Label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400">SELLING PRICE (₱)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...productForm.register("price")}
                      className={cn("bg-white border-slate-200 h-10 font-black text-lg", productForm.formState.errors.price && "border-red-500")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400">COST PRICE (₱)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...productForm.register("cost")}
                      className={cn("bg-white border-slate-200 h-10 font-black text-lg", productForm.formState.errors.cost && "border-red-500")}
                    />
                  </div>
                  <div className="col-span-2 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <span>Gross Margin</span>
                      <span className="text-green-600">Profitability</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <span className="text-sm font-black text-slate-900">₱{(productForm.watch("price") - productForm.watch("cost")).toFixed(2)}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 font-black">
                        {(( (productForm.watch("price") - productForm.watch("cost")) / (productForm.watch("price") || 1) ) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                {productForm.formState.errors.price && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.price.message}</p>}
              </div>

              {/* Stock Management */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Inventory Levels</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400">CURRENT STOCK</Label>
                    <Input 
                      type="number" 
                      {...productForm.register("stock")}
                      className={cn("bg-slate-50 border-slate-200 h-12 font-black text-xl text-center", productForm.formState.errors.stock && "border-red-500")}
                    />
                    {productForm.formState.errors.stock && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.stock.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400">LOW THRESHOLD</Label>
                    <Input 
                      type="number" 
                      {...productForm.register("minStock")}
                      className={cn("bg-slate-50 border-slate-200 h-12 font-black text-xl text-center", productForm.formState.errors.minStock && "border-red-500")}
                    />
                    {productForm.formState.errors.minStock && <p className="text-xs font-bold text-red-500">{productForm.formState.errors.minStock.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="p-6 border-t border-slate-100 bg-slate-50/50">
              <Button type="button" variant="outline" className="font-bold" onClick={() => setIsProductDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
                {editingProduct ? "Update Item" : "Save Product"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Category Drawer */}
      <Sheet open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen}>
        <SheetContent className="sm:max-w-md bg-white p-0">
          <form onSubmit={categoryForm.handleSubmit(onSaveCategory)} className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b border-slate-100">
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {editingCategory ? "Edit Category" : "New Category"}
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500">
                Organize your items into visual groups.
              </SheetDescription>
            </SheetHeader>

            <div className="p-6 space-y-8 flex-1">
              {/* Category Image */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Banner</Label>
                <div className="relative group w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center transition-all hover:border-blue-300">
                  {categoryForm.watch("image") ? (
                    <>
                      <img src={categoryForm.watch("image")} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button type="button" variant="secondary" size="sm" className="font-bold" onClick={() => categoryForm.setValue("image", "")}>
                          Remove
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className={cn("w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:scale-110 transition-transform", isUploading && "animate-pulse")}>
                        {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900">Upload Banner</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => handleImageUpload(e, "category")}
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </div>
                {categoryForm.formState.errors.image && <p className="text-xs font-bold text-red-500">{categoryForm.formState.errors.image.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Name</Label>
                <Input 
                  {...categoryForm.register("name")}
                  placeholder="e.g. Beverages, Hot Coffee, Pastries" 
                  className={cn("bg-slate-50 border-slate-200 h-12 font-bold uppercase", categoryForm.formState.errors.name && "border-red-500")}
                />
                {categoryForm.formState.errors.name && <p className="text-xs font-bold text-red-500">{categoryForm.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Color Group</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => {
                    const isUsed = usedColors.includes(color.value) && editingCategory?.color !== color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        disabled={isUsed}
                        onClick={() => categoryForm.setValue("color", color.value)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                          categoryForm.watch("color") === color.value 
                            ? "border-slate-900 scale-110" 
                            : "border-transparent",
                          isUsed ? "opacity-20 cursor-not-allowed grayscale" : "hover:scale-105"
                        )}
                        title={isUsed ? `${color.name} is already used` : color.name}
                      >
                        <div className={cn("w-6 h-6 rounded-full shadow-sm", color.bg)} />
                      </button>
                    );
                  })}
                </div>
                {categoryForm.formState.errors.color && (
                  <p className="text-xs font-bold text-red-500 mt-1">{categoryForm.formState.errors.color.message}</p>
                )}
              </div>
            </div>

            <SheetFooter className="p-6 border-t border-slate-100 bg-slate-50/50">
              <Button type="button" variant="outline" className="font-bold" onClick={() => setIsCategoryDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
                {editingCategory ? "Update Category" : "Save Category"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. To delete <strong>{productToDelete?.name}</strong>, please type the name below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type product name here..."
              className={deleteConfirmText === productToDelete?.name ? "border-green-500" : "border-red-200"}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setProductToDelete(null); setDeleteConfirmText(""); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteConfirmText !== productToDelete?.name}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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