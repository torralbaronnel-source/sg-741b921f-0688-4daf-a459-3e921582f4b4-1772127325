import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, 
  ChevronRight, Package, Tag, Percent, Info 
} from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/pos";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pocketpos_products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem("pocketpos_products", JSON.stringify(updated));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    saveProducts(updated);
    setIsDialogOpen(false);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

  // Calculate Grand Total for a product (Price + Tax - Discount)
  const getGrandTotal = (p: Product) => {
    const tax = (p.price * (p.taxRate || 0)) / 100;
    return Math.max(0, p.price + tax - (p.discount || 0));
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 font-sans text-[#0F172A]">
      <SEO title="Inventory | PocketPOS PH" />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/pos">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
        </div>

        {/* Search & Stats */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Stock Value</p>
              <p className="text-lg font-black text-blue-900">₱{totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Items</p>
              <p className="text-lg font-black text-slate-900">{totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 space-y-3">
        {filtered.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white">
                {product.emoji || "📦"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    Stock: {product.stock}
                  </span>
                  <span className="text-xs font-medium text-slate-400">₱{getGrandTotal(product).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(product)}
              className="rounded-xl bg-slate-50 hover:bg-slate-100"
            >
              <Edit2 className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Product</DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-slate-400 px-1">Product Name</label>
                <Input 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 px-1">Base Price (₱)</label>
                  <Input 
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 px-1">Current Stock</label>
                  <Input 
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 px-1 flex items-center gap-1">
                    VAT (%) <Info className="w-3 h-3 opacity-50" />
                  </label>
                  <Input 
                    type="number"
                    value={editingProduct.taxRate || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, taxRate: Number(e.target.value) })}
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 px-1">Discount (₱)</label>
                  <Input 
                    type="number"
                    value={editingProduct.discount || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount: Number(e.target.value) })}
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-blue-700">Calculated Grand Total:</span>
                  <span className="text-xl font-black text-blue-900">₱{getGrandTotal(editingProduct).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-blue-500 font-medium leading-tight">
                  Grand Total = (Base Price + {editingProduct.taxRate || 0}% VAT) - ₱{editingProduct.discount || 0} Discount
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-xl border-slate-200">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}