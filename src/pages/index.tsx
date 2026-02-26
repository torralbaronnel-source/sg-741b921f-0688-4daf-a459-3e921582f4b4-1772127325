import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  ShoppingCart, 
  Package, 
  ReceiptText, 
  Settings,
  Plus,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    sales: 0,
    transactions: 0,
    lowStock: 0
  });

  useEffect(() => {
    // Basic stats logic
    setStats({
      sales: 12450.50,
      transactions: 42,
      lowStock: 3
    });
  }, []);

  const menuItems = [
    { title: "Point of Sale", icon: <ShoppingCart className="w-6 h-6" />, href: "/pos", color: "bg-blue-500" },
    { title: "Inventory", icon: <Package className="w-6 h-6" />, href: "/inventory", color: "bg-orange-500" },
    { title: "Transactions", icon: <ReceiptText className="w-6 h-6" />, href: "/transactions", color: "bg-green-500" },
    { title: "Settings", icon: <Settings className="w-6 h-6" />, href: "/settings", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEO title="Dashboard | PocketPOS PH" description="Fast & Functional POS for PH Businesses" />
      
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold text-slate-900">PocketPOS <span className="text-blue-600">PH</span></h1>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="font-bold text-slate-600 text-xs">JD</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Today's Sales</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₱{stats.sales.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.transactions}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Main Menu</h2>
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-transform">
                  <div className={`${item.color} p-3 rounded-xl text-white`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <section className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-orange-900 text-sm">{stats.lowStock} Items Low on Stock</p>
                <p className="text-orange-700 text-xs">Update your inventory soon.</p>
              </div>
            </div>
            <Link href="/inventory" className="text-orange-600">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </section>
        )}

        {/* Recent Transactions placeholder */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h2>
            <Link href="/transactions" className="text-blue-600 text-xs font-bold">View All</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 flex justify-between items-center border-b last:border-0 border-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <ReceiptText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Order #10{42-i}</p>
                    <p className="text-slate-400 text-xs">Today, 2:45 PM</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">₱{(Math.random() * 500 + 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Quick Action Floating Button */}
      <Link href="/pos" className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-white active:scale-90 transition-transform">
        <Plus className="w-8 h-8" />
      </Link>
    </div>
  );
}