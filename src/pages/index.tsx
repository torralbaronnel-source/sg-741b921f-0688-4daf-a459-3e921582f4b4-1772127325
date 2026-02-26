import React from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const stats = [
    { label: "Today's Sales", value: "₱12,450.00", trend: "+12%", icon: TrendingUp, color: "text-blue-600" },
    { label: "Orders", value: "48", trend: "+5", icon: ShoppingCart, color: "text-purple-600" },
    { label: "Low Stock", value: "3", trend: "Alert", icon: AlertCircle, color: "text-orange-500" },
  ];

  const quickActions = [
    { name: "New Sale", href: "/pos", icon: Plus, color: "bg-blue-600" },
    { name: "Inventory", href: "/inventory", icon: Package, color: "bg-slate-800" },
    { name: "Reports", href: "/transactions", icon: History, color: "bg-slate-800" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO title="Dashboard | PocketPOS PH" />

      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PocketPOS</h1>
            <p className="text-slate-500 font-medium">Brew & Bites Cafe • Feb 26</p>
          </div>
          <Link href="/settings">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center tap-active">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 space-y-6 mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-3xl"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-2xl bg-slate-50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 px-2 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link key={action.name} href={action.href} className="block">
                <div className={`glass-card p-6 rounded-[2.5rem] flex flex-col items-center justify-center space-y-3 tap-active ${action.name === "New Sale" ? "ring-2 ring-blue-500/20" : ""}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-900">{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav Blur */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 glass-card rounded-full flex items-center justify-around px-4 z-50">
        <Link href="/" className="p-2 text-blue-600"><LayoutDashboard className="w-6 h-6" /></Link>
        <Link href="/pos" className="p-3 bg-blue-600 text-white rounded-full -mt-10 shadow-lg shadow-blue-500/40 tap-active"><ShoppingCart className="w-6 h-6" /></Link>
        <Link href="/inventory" className="p-2 text-slate-400"><Package className="w-6 h-6" /></Link>
      </nav>
    </div>
  );
}