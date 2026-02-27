import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  ArrowRight,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sale, Product } from "@/types/pos";

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem("pocketpos_sales");
    const savedProducts = localStorage.getItem("pocketpos_products");
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    setIsLoaded(true);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(s => new Date(s.timestamp).toLocaleDateString() === today);
    
    const grossTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
    const netTotal = grossTotal / 1.12;
    const vatTotal = grossTotal - netTotal;
    
    const lowStock = products.filter(p => p.stock <= 5).length;
    
    // Hourly Breakdown
    const hourlyData: Record<number, number> = {};
    todaySales.forEach(s => {
      const hour = new Date(s.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + s.total;
    });

    return {
      grossTotal,
      netTotal,
      vatTotal,
      lowStock,
      orderCount: todaySales.length,
      hourlyData
    };
  }, [sales, products]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <SEO title="Dashboard | PocketPOS PH" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">POCKETPOS PH</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Store Dashboard</p>
            </div>
          </div>
          <Link href="/pos">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2 rounded-lg text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
              OPEN TERMINAL <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Real-time Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-blue-600" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross Sales (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">₱{stats.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">{stats.orderCount} TRANSACTIONS</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Sales (Excl. VAT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">₱{stats.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">12% VAT DEDUCTED</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-slate-800" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">VAT Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">₱{stats.vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">REVERSE CALCULATED</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-1 bg-orange-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{stats.lowStock} Items</div>
              <p className="text-[10px] font-bold text-orange-600 mt-1 uppercase">BELOW THRESHOLD</p>
            </CardContent>
          </Card>
        </div>

        {/* High-Density Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Velocity */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Hourly Sales Velocity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {Object.keys(stats.hourlyData).length > 0 ? (
                  Object.entries(stats.hourlyData)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([hour, total]) => (
                      <div key={hour} className="flex justify-between items-center p-4">
                        <span className="text-xs font-bold text-slate-600">
                          {Number(hour) % 12 || 12}:00 {Number(hour) >= 12 ? 'PM' : 'AM'}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full transition-all duration-500" 
                              style={{ width: `${(total / stats.grossTotal) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-black tabular-nums">₱{total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    No sales recorded today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Inventory Stock-In */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Critical Stock</CardTitle>
              </div>
              <Link href="/inventory">
                <Badge variant="outline" className="text-[10px] font-black uppercase border-blue-200 text-blue-600 cursor-pointer">
                  Manage All
                </Badge>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {products.filter(p => p.stock <= 10).slice(0, 6).map(product => (
                  <div key={product.id} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{product.emoji || '📦'}</span>
                      <div>
                        <div className="text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">{product.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">SKU: {product.sku || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${product.stock <= 5 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock} LEFT
                      </div>
                      <Progress value={(product.stock / 50) * 100} className="h-1 w-16 mt-1" />
                    </div>
                  </div>
                ))}
                {products.filter(p => p.stock <= 10).length === 0 && (
                  <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    All stock levels healthy
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation - Locked Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50">
        <div className="max-w-7xl mx-auto flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/pos" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">POS</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Items</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sales</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}