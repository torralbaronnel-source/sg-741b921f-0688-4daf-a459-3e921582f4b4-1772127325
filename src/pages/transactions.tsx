import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, 
  ReceiptText, 
  ChevronRight,
  Filter,
  Calendar,
  Download
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Mocking historical transactions
    setTransactions([
      { id: "1042", total: 245.50, items: 3, method: "CASH", time: "Today, 2:45 PM" },
      { id: "1041", total: 120.00, items: 1, method: "E-WALLET", time: "Today, 1:20 PM" },
      { id: "1040", total: 580.75, items: 5, method: "CARD", time: "Today, 11:15 AM" },
      { id: "1039", total: 45.00, items: 1, method: "CASH", time: "Yesterday, 8:30 PM" },
      { id: "1038", total: 1250.00, items: 12, method: "CASH", time: "Yesterday, 6:45 PM" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEO title="Transactions | PocketPOS PH" />
      
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="flex items-center space-x-4 max-w-lg mx-auto w-full">
          <Link href="/" className="p-2 -ml-2 text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold flex-1">Transactions</h1>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-white rounded-xl text-xs font-bold border-slate-200">
            <Calendar className="w-3.5 h-3.5 mr-1.5" /> This Week
          </Button>
          <Button variant="outline" size="sm" className="bg-white rounded-xl text-xs font-bold border-slate-200">
            <Filter className="w-3.5 h-3.5 mr-1.5" /> All Methods
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {mounted && transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between border-b last:border-0 border-slate-50 active:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-800 text-sm">Order #{tx.id}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                      {tx.method}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{tx.time} • {tx.items} items</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-black text-slate-900 text-sm">₱{tx.total.toFixed(2)}</p>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}

          {!mounted && <div className="p-8 text-center text-slate-400 text-sm">Loading history...</div>}
        </div>

        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Weekly Summary</p>
          <p className="text-3xl font-black">₱24,850.25</p>
          <div className="mt-4 flex justify-between items-end">
             <div className="space-y-1">
               <p className="text-[10px] text-blue-200 font-bold uppercase">Avg. Ticket Size</p>
               <p className="font-bold">₱350.50</p>
             </div>
             <div className="bg-blue-500/30 px-3 py-1.5 rounded-xl border border-blue-400/30">
                <p className="text-[10px] text-blue-100 font-bold">+12% from last week</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}