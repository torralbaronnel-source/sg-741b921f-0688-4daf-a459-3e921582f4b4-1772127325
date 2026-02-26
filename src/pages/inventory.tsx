import React, { useState } from "react";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Plus, Minus, Package, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types/pos";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <SEO title="Inventory | PocketPOS PH" />
      
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-black text-xl tracking-tight">INVENTORY</h1>
          </div>
          {lowStockCount > 0 && (
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-black">{lowStockCount} LOW</span>
            </div>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full pl-9 pr-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="p-4 space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.category}</span>
              <span className="font-bold text-slate-900 leading-tight">{product.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Stock:</span>
                <span className={`text-sm font-black ${product.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                  {product.stock}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
              <button 
                onClick={() => updateStock(product.id, -1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg active:bg-slate-100 transition-colors"
              >
                <Minus className="w-5 h-5 text-slate-600" />
              </button>
              <button 
                onClick={() => updateStock(product.id, 1)}
                className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-lg active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 font-bold">No items found</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white p-5 rounded-2xl shadow-2xl active:scale-90 transition-transform flex items-center gap-2 font-black">
          <Plus className="w-6 h-6" />
          <span>ADD NEW</span>
        </button>
      </div>
    </div>
  );
}