import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Package, MoreVertical, 
  Trash2, Edit2, LayoutGrid, List, Filter,
  TrendingDown, DollarSign, Tag, Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productService, type Product, type Category } from "@/services/productService";
import { useForm } from "react-hook-form";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const productForm = useForm({
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      category_id: "",
      sku: "",
      image: ""
    }
  });

  // Fetch data and subscribe to realtime changes
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

  const handleSaveProduct = async (data: any) => {
    try {
      await productService.upsertProduct({
        id: editingProduct?.id || crypto.randomUUID(),
        ...data,
        price: Number(data.price),
        stock: Number(data.stock)
      });
      toast({ title: editingProduct ? "Product updated" : "Product created" });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Save failed" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      toast({ title: "Product deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete failed" });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalItems: products.length,
    totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
    lowStock: products.filter(p => p.stock < 10).length
  };

  return (
    <SidebarLayout>
      <SEO title="Inventory Management - PocketPOS PH" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory</h1>
            <p className="text-slate-500 mt-1">Manage your products and stock levels in real-time.</p>
          </div>
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-blue-500/20 px-6 py-6 h-auto">
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  Enter product details. All changes are saved instantly to the database.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={productForm.handleSubmit(handleSaveProduct)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input {...productForm.register("name")} placeholder="e.g. Iced Caramel Macchiato" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₱)</Label>
                    <Input type="number" {...productForm.register("price")} placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" {...productForm.register("stock")} placeholder="0" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={productForm.watch("category_id")} 
                    onValueChange={(val) => productForm.setValue("category_id", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SKU (Optional)</Label>
                  <Input {...productForm.register("sku")} placeholder="COF-001" />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full rounded-xl">Save Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Value</p>
                  <p className="text-2xl font-bold">₱{stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                className="pl-10 rounded-xl bg-white" 
                placeholder="Search by name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] rounded-xl bg-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm font-medium">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.sku || "No SKU"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="outline" className="rounded-lg font-normal bg-white">
                        {categories.find(c => c.id === product.category_id)?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">₱{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${product.stock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {product.stock}
                        </span>
                        {product.stock < 10 && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                            Low
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => {
                            setEditingProduct(product);
                            productForm.reset(product);
                            setIsProductDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}