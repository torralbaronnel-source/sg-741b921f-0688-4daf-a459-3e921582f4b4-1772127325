import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Filter, Download, Calendar, ArrowRight, Printer, Receipt, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Sale, PaymentMethod } from "@/types/pos";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "ALL">("ALL");

  useEffect(() => {
    const savedSales = localStorage.getItem("pos_sales");
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = selectedMethod === "ALL" || sale.paymentMethod === selectedMethod;
      return matchesSearch && matchesMethod;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, searchTerm, selectedMethod]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const count = filteredSales.length;
    const cash = filteredSales.filter(s => s.paymentMethod === "CASH").reduce((acc, s) => acc + s.total, 0);
    const digital = total - cash;
    return { total, count, cash, digital };
  }, [filteredSales]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SEO title="Transaction History - PocketPOS PH" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sales</div>
              <div className="text-2xl font-bold text-slate-900">₱{stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Orders</div>
              <div className="text-2xl font-bold text-slate-900">{stats.count}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cash</div>
              <div className="text-2xl font-bold text-emerald-600">₱{stats.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Digital</div>
              <div className="text-2xl font-bold text-blue-600">₱{stats.digital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search by Order No..." 
              className="pl-10 h-11 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedMethod === "ALL" ? "default" : "outline"}
              onClick={() => setSelectedMethod("ALL")}
              className="h-11"
            >
              All
            </Button>
            <Button 
              variant={selectedMethod === "CASH" ? "default" : "outline"}
              onClick={() => setSelectedMethod("CASH")}
              className="h-11"
            >
              Cash
            </Button>
            <Button 
              variant={selectedMethod === "QR_PH" ? "default" : "outline"}
              onClick={() => setSelectedMethod("QR_PH")}
              className="h-11"
            >
              Digital
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-200 font-bold">
                <th className="px-6 py-4">Time / Order</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 uppercase text-xs font-bold tracking-widest">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-900">#{sale.orderNo}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        sale.paymentMethod === "CASH" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )} variant="outline">
                        {sale.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 font-medium">
                        {sale.items.length} {sale.items.length === 1 ? 'Item' : 'Items'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {sale.items.map(i => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      ₱{sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}