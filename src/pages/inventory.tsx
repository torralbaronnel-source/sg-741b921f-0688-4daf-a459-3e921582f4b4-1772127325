import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  Plus, 
  Search, 
  Package, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/pos";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Load products
  useEffect(() => {
    const saved = localStorage.getItem("pocketpos_products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(MOCK_PRODUCTS);
      localStorage.setItem("pocketpos_products", JSON.stringify(MOCK_PRODUCTS));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("pocketpos_products", JSON.stringify(newProducts));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct({
      name: "",
      price: 0,
      stock: 0,
      category: categories[0] || "General",
      emoji: "📦"
    });
    setIsEditorOpen(true);
  };

  const saveProduct = () => {
    if (!editingProduct?.name) return;

    let updated: Product[];
    if ("id" in editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p);
    } else {
      const newProduct = {
        ...editingProduct,
        id: Math.random().toString(36).substr(2, 9),
      } as Product;
      updated = [...products, newProduct];
    }

    saveProducts(updated);
    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO title="Inventory - PocketPOS PH" />

      {/* Header */}
      <header className="glass-card sticky top-0 z-20 border-b-0 rounded-none px-4 py-4 mb-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Inventory</h1>
          </div>
          <Button 
            onClick={handleAddNew}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> New Item
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-4">
        {/* Search & Summary */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search items or categories..." 
            className="pl-9 bg-white border-slate-100 h-12 rounded-2xl shadow-sm focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass-card p-4 rounded-3xl border-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{products.length}</p>
          </div>
          <div className="glass-card p-4 rounded-3xl border-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Value</p>
            <p className="text-2xl font-black text-primary leading-none tracking-tighter">
              ₱{products.reduce((s, p) => s + (p.price * p.stock), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="glass-card p-3 rounded-2xl border-0 flex items-center gap-4 group hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden relative border border-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{product.emoji || "📦"}</span>
                )}
                {product.stock < 5 && (
                  <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                    <div className="bg-red-500 w-1.5 h-1.5 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-black text-slate-900 truncate">{product.name}</h3>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-slate-50 border-none px-1.5 py-0">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary">₱{product.price}</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                    product.stock < 5 ? "text-red-500" : "text-slate-400"
                  )}>
                    <Package className="w-3 h-3" /> {product.stock} in stock
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Product Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl border-none p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingProduct?.id ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 space-y-6">
              {/* Image / Emoji Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl relative overflow-hidden border-2 border-dashed border-slate-200 group">
                  {editingProduct?.imageUrl ? (
                    <img src={editingProduct.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{editingProduct?.emoji || "📦"}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="w-5 h-5 text-white" />
                    <span className="text-[10px] text-white font-bold">CHANGE</span>
                  </div>
                </div>
                
                <div className="w-full grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image URL (Optional)</Label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      className="rounded-xl bg-slate-50 border-none h-10"
                      value={editingProduct?.imageUrl || ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, imageUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emoji (Fallback)</Label>
                    <Input 
                      placeholder="☕" 
                      className="rounded-xl bg-slate-50 border-none h-10 w-16 text-center text-xl"
                      maxLength={2}
                      value={editingProduct?.emoji || ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, emoji: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name</Label>
                  <Input 
                    placeholder="e.g. Iced Americano" 
                    className="rounded-xl bg-slate-50 border-none h-12 text-lg font-bold"
                    value={editingProduct?.name || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev!, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₱)</Label>
                    <Input 
                      type="number"
                      placeholder="0.00" 
                      className="rounded-xl bg-slate-50 border-none h-12 font-bold text-primary"
                      value={editingProduct?.price || ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount (%)</Label>
                    <Input 
                      type="number"
                      placeholder="0" 
                      className="rounded-xl bg-slate-50 border-none h-12 font-bold text-red-500"
                      value={editingProduct?.discount || ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, discount: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stock</Label>
                    <Input 
                      type="number"
                      placeholder="0" 
                      className="rounded-xl bg-slate-50 border-none h-12 font-bold"
                      value={editingProduct?.stock || ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, stock: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                    <Select 
                      value={editingProduct?.category} 
                      onValueChange={(v) => setEditingProduct(prev => ({ ...prev!, category: v }))}
                    >
                      <SelectTrigger className="rounded-xl bg-slate-50 border-none h-12 font-bold">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={saveProduct} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex-1 h-12 shadow-lg shadow-primary/20">
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}