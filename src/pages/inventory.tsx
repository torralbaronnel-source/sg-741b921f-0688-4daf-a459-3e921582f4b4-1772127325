import React, { useState } from "react";
import { SEO } from "@/components/SEO";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { Product } from "@/types/pos";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit2, 
  MoreVertical,
  Package,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEO title="Inventory | PocketPOS PH" />
      
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="flex items-center space-x-4 max-w-lg mx-auto w-full">
          <Link href="/" className="p-2 -ml-2 text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold flex-1">Inventory</h1>
          <Button size="sm" className="bg-blue-600 rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="max-w-lg mx-auto mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, category or ID..." 
            className="pl-10 bg-slate-100 border-none rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 flex items-center justify-between border-b last:border-0 border-slate-50">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  product.stock <= 10 ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-600"
                )}>
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-slate-400 text-xs uppercase font-medium">{product.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-bold text-xs">₱{product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    product.stock <= 10 ? "text-orange-600" : "text-slate-900"
                  )}>
                    {product.stock}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">In Stock</p>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No products found</p>
            </div>
          )}
        </div>

        {/* Inventory Summary Helper */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 p-4 rounded-2xl text-white">
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Total Value</p>
            <p className="text-xl font-black mt-1">
              ₱{products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Low Stock Items</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xl font-black text-orange-600">
                {products.filter(p => p.stock <= 10).length}
              </p>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Utility for conditional classes since I used it above
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}