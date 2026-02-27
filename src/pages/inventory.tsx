import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ArrowLeft, Package, History, TrendingUp, Filter, AlertTriangle, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Product, InventoryMovement, AppSettings } from "@/types/pos";
import { MOCK_PRODUCTS, MOCK_MOVEMENTS, INITIAL_SETTINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"list" | "stock-in" | "logs">("list");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockInValues, setStockInValues] = useState<Record<string, { qty: string; cost: string }>>({});

  useEffect(() => {
    const savedProducts = localStorage.getItem("pos_products");
    const savedMovements = localStorage.getItem("pos_movements");
    const savedSettings = localStorage.getItem("pos_settings");
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(MOCK_PRODUCTS);

    if (savedMovements) setMovements(JSON.parse(savedMovements));
    else setMovements(MOCK_MOVEMENTS);

    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockIn = () => {
    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map(p => {
      const entry = stockInValues[p.id];
      if (entry && entry.qty && parseInt(entry.qty) !== 0) {
        const qtyToAdd = parseInt(entry.qty);
        newMovements.push({
          id: `m-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: "STOCK_IN",
          quantity: qtyToAdd,
          timestamp: new Date().toISOString(),
          reason: "Bulk Stock-In"
        });
        return { 
          ...p, 
          stock: p.stock + qtyToAdd,
          cost: entry.cost ? parseFloat(entry.cost) : p.cost
        };
      }
      return p;
    });

    const finalMovements = [...newMovements, ...movements];
    setProducts(updatedProducts);
    setMovements(finalMovements);
    localStorage.setItem("pos_products", JSON.stringify(updatedProducts));
    localStorage.setItem("pos_movements", JSON.stringify(finalMovements));
    setStockInValues({});
    setActiveTab("list");
  };

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SEO title="Inventory Management - PocketPOS PH" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1">Inventory</h1>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === "list" ? "default" : "outline"} 
            onClick={() => setActiveTab("list")}
            className="h-9"
          >
            <Package className="w-4 h-4 mr-2" /> List
          </Button>
          <Button 
            variant={activeTab === "stock-in" ? "default" : "outline"} 
            onClick={() => setActiveTab("stock-in")}
            className="h-9"
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Stock-In
          </Button>
          <Button 
            variant={activeTab === "logs" ? "default" : "outline"} 
            onClick={() => setActiveTab("logs")}
            className="h-9"
          >
            <History className="w-4 h-4 mr-2" /> Logs
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === "list" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500">Total Items</div>
                  <div className="text-2xl font-bold text-slate-900">{products.length}</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500">Inventory Value (Cost)</div>
                  <div className="text-2xl font-bold text-slate-900">₱{totalInventoryValue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-slate-500">Low Stock Alerts</div>
                  <div className="text-2xl font-bold text-red-600">{products.filter(p => p.stock <= p.lowStockThreshold).length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  placeholder="Search by name or SKU..." 
                  className="pl-10 h-11 bg-white border-slate-200 focus:ring-0 focus:border-slate-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="h-11 px-6 bg-[#0F172A] hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold">SKU / Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Cost</th>
                    <th className="px-6 py-4 font-semibold text-right">Price</th>
                    <th className="px-6 py-4 font-semibold text-center">Stock</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{product.emoji}</span>
                          <div>
                            <div className="text-xs font-mono text-slate-400 uppercase tracking-tighter">#{product.sku}</div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-500">₱{product.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">₱{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "font-mono font-bold px-2 py-1 rounded",
                          product.stock <= product.lowStockThreshold ? "bg-red-50 text-red-600" : "text-slate-900"
                        )}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {product.stock <= product.lowStockThreshold ? (
                          <Badge className="bg-red-500 hover:bg-red-600">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">Optimal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "stock-in" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bulk Stock-In</h2>
                <p className="text-slate-500 text-sm">Rapidly replenish your inventory levels and update costs.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-11" onClick={() => setStockInValues({})}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button className="h-11 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStockIn}>
                  <Save className="w-4 h-4 mr-2" /> Commit Stock
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold text-right w-32">Current Stock</th>
                    <th className="px-6 py-4 font-semibold text-right w-40">New Cost (₱)</th>
                    <th className="px-6 py-4 font-semibold text-right w-40">Add Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{product.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900">{product.name}</div>
                            <div className="text-xs font-mono text-slate-400">#{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "font-mono font-bold",
                          product.stock <= product.lowStockThreshold ? "text-red-600" : "text-slate-600"
                        )}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          placeholder={product.cost.toString()}
                          className="text-right font-mono h-10 border-slate-200"
                          value={stockInValues[product.id]?.cost || ""}
                          onChange={(e) => setStockInValues({
                            ...stockInValues,
                            [product.id]: { ...stockInValues[product.id], cost: e.target.value }
                          })}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input 
                          type="number"
                          placeholder="0"
                          className="text-right font-mono h-10 border-blue-200 bg-blue-50/30 focus:bg-white"
                          value={stockInValues[product.id]?.qty || ""}
                          onChange={(e) => setStockInValues({
                            ...stockInValues,
                            [product.id]: { ...stockInValues[product.id], qty: e.target.value }
                          })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Inventory Logs</h2>
                <p className="text-slate-500 text-sm">Full audit trail of all stock movements.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold text-right">Qty</th>
                    <th className="px-6 py-4 font-semibold">Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{log.productName}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          log.type === "STOCK_IN" ? "bg-emerald-500" : 
                          log.type === "SALE" ? "bg-blue-500" : 
                          log.type === "WASTE" ? "bg-red-500" : "bg-slate-500"
                        )}>
                          {log.type}
                        </Badge>
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right font-mono font-bold",
                        log.quantity > 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm italic">{log.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}