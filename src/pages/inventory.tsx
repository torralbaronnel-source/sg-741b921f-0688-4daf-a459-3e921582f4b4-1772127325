import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Package, 
  TrendingDown, 
  AlertCircle,
  Pencil,
  Trash2,
  ChevronRight,
  RefreshCw,
  Upload,
  X,
  CheckCircle2,
  DollarSign,
  Tag,
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  Edit
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Product, Category } from "@/types/pos";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters").regex(/^[a-zA-Z0-9-]+$/, "SKU must be alphanumeric (letters, numbers, dashes)"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  minStock: z.coerce.number().min(1, "Minimum stock alert must be at least 1"),
  categoryId: z.string().min(1, "Please select a category"),
  image: z.string().optional(),
}).refine((data) => data.price >= data.cost, {
  message: "Selling price should be greater than or equal to cost",
  path: ["price"],
});

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  image: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("products");

  // Form States
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 10,
      categoryId: "",
      image: ""
    }
  });

  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    setValue: setValueCat,
    formState: { errors: catErrors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: ""
    }
  });

  const watchPrice = watch("price");
  const watchCost = watch("cost");

  // Sync form with editingProduct state
  useEffect(() => {
    if (editingProduct) {
      reset({
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: editingProduct.price,
        cost: editingProduct.cost,
        stock: editingProduct.stock,
        minStock: editingProduct.minStock || 10,
        categoryId: editingProduct.categoryId,
        image: editingProduct.image || ""
      });
    }
  }, [editingProduct, reset]);

  // Stats
  const totalItems = products.length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const potentialRevenue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 10)).length;

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Only image files are allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        setValue("image", data.url);
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, image: data.url });
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onSubmitProduct = (data: ProductFormData) => {
    if (!editingProduct) return;

    const updatedProduct = {
      ...editingProduct,
      ...data,
    };

    if (products.find(p => p.id === updatedProduct.id)) {
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast({ title: "Success", description: "Product updated successfully" });
    } else {
      setProducts([...products, updatedProduct]);
      toast({ title: "Success", description: "Product added successfully" });
    }
    setIsProductDrawerOpen(false);
    setEditingProduct(null);
    reset();
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Delete ${product.name}? This cannot be undone.`)) {
      if (product.image && product.image.startsWith("/uploads/")) {
        try {
          await fetch(`/api/delete-image?url=${encodeURIComponent(product.image)}`, {
            method: "DELETE"
          });
        } catch (err) {
          console.error("Failed to delete image file", err);
        }
      }

      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Product removed" });
    }
  };

  const generateSKU = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setValue("sku", `SKU-${random}`, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 md:pb-0">
      <SEO title="Inventory Pro | PocketPOS PH" />
      
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Inventory Pro</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stock Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setEditingProduct({
                  id: `new-${Date.now()}`,
                  name: "",
                  sku: "",
                  price: 0,
                  cost: 0,
                  stock: 0,
                  categoryId: "",
                  image: ""
                });
                reset({
                  name: "",
                  sku: "",
                  price: 0,
                  cost: 0,
                  stock: 0,
                  minStock: 10,
                  categoryId: "",
                  image: ""
                });
                setIsProductDrawerOpen(true);
              }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-200/50 gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Items</p>
                <p className="text-lg font-bold text-slate-900">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Low Stock</p>
                <p className="text-lg font-bold text-slate-900">{lowStockCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Asset Value</p>
                <p className="text-lg font-bold text-slate-900">₱{totalValue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Est. Revenue</p>
                <p className="text-lg font-bold text-slate-900">₱{potentialRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search SKU, Name..." 
                className="pl-10 border-none bg-slate-50 focus-visible:ring-1 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="products" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-slate-50 p-1">
                <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Products</TabsTrigger>
                <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Categories</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">{product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium bg-slate-50 text-slate-600 border-slate-200">
                        {categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900">₱{product.price.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Cost: ₱{product.cost}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-sm font-bold ${product.stock <= (product.minStock || 10) ? 'text-amber-600' : 'text-slate-900'}`}>
                          {product.stock} units
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              product.stock <= (product.minStock || 10) ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductDrawerOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Sheet open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md border-l border-slate-200 p-0 overflow-y-auto">
          {editingProduct && (
            <form onSubmit={handleSubmit(onSubmitProduct)} className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-bold">{editingProduct.id.startsWith('new') ? 'Add Product' : 'Edit Product'}</SheetTitle>
                  <SheetClose className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </SheetClose>
                </div>
                <SheetDescription>Configure item details, stock and pricing</SheetDescription>
              </SheetHeader>

              <div className="p-6 space-y-6 flex-1">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Product Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative group">
                      {watch("image") ? (
                        <>
                          <img src={watch("image")} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:bg-white/20"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-5 h-5" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:bg-white/20"
                              onClick={() => setValue("image", "")}
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-100 w-full h-full justify-center transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-[10px] font-medium text-slate-500 text-center px-4">Click to upload JPEG/PNG</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/jpeg,image/png" 
                      className="hidden" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                    <Input 
                      {...register("name")}
                      id="name" 
                      placeholder="e.g. Classic Americano"
                      className={cn("border-slate-200 focus:border-blue-500", errors.name && "border-red-500")}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sku" className="text-sm font-semibold">SKU / Item Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        {...register("sku")}
                        id="sku" 
                        placeholder="e.g. COF-001"
                        className={cn("font-mono text-sm border-slate-200", errors.sku && "border-red-500")}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={generateSKU} className="shrink-0 border-slate-200">
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                    {errors.sku && <p className="text-[10px] text-red-500 font-medium">{errors.sku.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                    <Select 
                      value={watch("categoryId")} 
                      onValueChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
                    >
                      <SelectTrigger className={cn("border-slate-200", errors.categoryId && "border-red-500")}>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-[10px] text-red-500 font-medium">{errors.categoryId.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cost" className="text-sm font-semibold">Cost (PHP)</Label>
                      <Input 
                        {...register("cost")}
                        id="cost" 
                        type="number"
                        step="0.01"
                        className={cn("border-slate-200", errors.cost && "border-red-500")}
                      />
                      {errors.cost && <p className="text-[10px] text-red-500 font-medium">{errors.cost.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-sm font-semibold">Price (PHP)</Label>
                      <Input 
                        {...register("price")}
                        id="price" 
                        type="number"
                        step="0.01"
                        className={cn("border-slate-200", errors.price && "border-red-500")}
                      />
                      {errors.price && <p className="text-[10px] text-red-500 font-medium">{errors.price.message}</p>}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Gross Margin</p>
                      <p className="text-lg font-bold text-blue-900">
                        ₱{(watchPrice - watchCost || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Margin %</p>
                      <p className="text-lg font-bold text-blue-900">
                        {watchPrice > 0 ? (((watchPrice - watchCost) / watchPrice) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock" className="text-sm font-semibold">Initial Stock</Label>
                      <Input 
                        {...register("stock")}
                        id="stock" 
                        type="number"
                        className={cn("border-slate-200", errors.stock && "border-red-500")}
                      />
                      {errors.stock && <p className="text-[10px] text-red-500 font-medium">{errors.stock.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minStock" className="text-sm font-semibold">Min. Threshold</Label>
                      <Input 
                        {...register("minStock")}
                        id="minStock" 
                        type="number"
                        className={cn("border-slate-200", errors.minStock && "border-red-500")}
                      />
                      {errors.minStock && <p className="text-[10px] text-red-500 font-medium">{errors.minStock.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
                <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 rounded-xl shadow-lg shadow-blue-200/50">
                  Save Product
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}