import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, ArrowLeft, CheckCircle2, Share2 } from "lucide-react";
import { transactionService } from "@/services/transactionService";
import { Badge } from "@/components/ui/badge";

export default function ReceiptPage() {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = async () => {
    try {
      const data = await transactionService.getTransactionById(id as string);
      setTransaction(data);
    } catch (error) {
      console.error("Error loading receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SidebarLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </SidebarLayout>
  );

  if (!transaction) return (
    <SidebarLayout>
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Receipt not found</h2>
        <Button onClick={() => router.push("/pos")} className="mt-4">Back to POS</Button>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <SEO title={`Receipt ${transaction.order_no} | PocketPOS PH`} />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/pos")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Order
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Card className="p-8 space-y-6 border-slate-200 shadow-xl bg-white relative overflow-hidden print:shadow-none print:border-none">
          {/* Success Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-2 print:hidden">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">PocketPOS PH</h1>
            <p className="text-slate-500 text-sm">Order #{transaction.order_no}</p>
            <p className="text-slate-400 text-xs">
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-6 space-y-4">
            {transaction.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-400 font-mono">{item.quantity}x</span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-semibold">₱{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>₱{transaction.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-slate-900">Total Paid</span>
              <span className="text-2xl font-black text-blue-600">₱{transaction.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center text-sm print:bg-white print:border">
            <span className="text-slate-500">Payment Method</span>
            <Badge variant="outline" className="bg-white font-bold">{transaction.payment_method}</Badge>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 italic">
            Thank you for your business!
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          nav, button, .sidebar, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </SidebarLayout>
  );
}