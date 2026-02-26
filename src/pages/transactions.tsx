import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  X,
  Receipt,
  Package,
  Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Sale, PaymentMethod } from "@/types/pos";
import { MOCK_SALES } from "@/lib/mock-data";
import { format, isWithinInterval, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DateRangeType = 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Enhance mock data with items if they don't exist
  const salesWithItems: Sale[] = useMemo(() => {
    return MOCK_SALES.map(sale => ({
      ...sale,
      items: sale.items || [
        { id: "1", name: "Iced Latte", quantity: 2, price: 120 },
        { id: "2", name: "Croissant", quantity: 1, price: 85 }
      ]
    }));
  }, []);

  const filteredSales = useMemo(() => {
    return salesWithItems.filter((sale) => {
      const matchesSearch = sale.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sale.providerRef?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMethod = filterMethod === "ALL" || sale.paymentMethod === filterMethod;
      return matchesSearch && matchesMethod;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchTerm, filterMethod, salesWithItems]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMethod]);

  const exportToCSV = (range?: DateRangeType) => {
    let dataToExport = filteredSales;

    if (range && range !== 'all') {
      const now = new Date();
      let start: Date, end: Date;

      switch (range) {
        case 'today': start = startOfDay(now); end = endOfDay(now); break;
        case '7days': start = subDays(startOfDay(now), 7); end = endOfDay(now); break;
        case '30days': start = subDays(startOfDay(now), 30); end = endOfDay(now); break;
        case 'thisMonth': start = startOfMonth(now); end = endOfMonth(now); break;
        case 'lastMonth': {
          const lastMonth = subMonths(now, 1);
          start = startOfMonth(lastMonth);
          end = endOfMonth(lastMonth);
          break;
        }
        case 'thisYear': start = startOfYear(now); end = endOfYear(now); break;
        case 'lastYear': {
          const lastYear = subDays(startOfYear(now), 1);
          start = startOfYear(lastYear);
          end = endOfYear(lastYear);
          break;
        }
        default: start = new Date(0); end = now;
      }

      dataToExport = salesWithItems.filter(sale => 
        isWithinInterval(new Date(sale.createdAt), { start, end })
      );
    }

    if (dataToExport.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = ["Order No", "Date", "Total", "Method", "Status", "Reference"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(s => [
        s.orderNo,
        format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"),
        s.total,
        s.paymentMethod,
        s.status,
        s.providerRef || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${range || 'filtered'}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${dataToExport.length} transactions.`,
    });
  };

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsPanelExpanded(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-24 lg:pb-0">
      <SEO title="Transactions | PocketPOS PH" />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#0F172A]">History</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem onClick={() => exportToCSV()}>Current View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('7days')}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('30days')}>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('thisMonth')}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('lastMonth')}>Last Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('all')}>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search Order # or Ref..." 
              className="pl-10 h-12 bg-white border-slate-200 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["ALL", "CASH", "QR_PH", "CARD", "MAYA_TERMINAL"].map((method) => (
              <Button
                key={method}
                variant={filterMethod === method ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full whitespace-nowrap h-10 px-4",
                  filterMethod === method ? "bg-[#2563EB]" : "bg-white text-slate-600 border-slate-200"
                )}
                onClick={() => setFilterMethod(method as any)}
              >
                {method.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction Table */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Order</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedSales.map((sale) => (
                    <tr 
                      key={sale.id} 
                      className={cn(
                        "hover:bg-slate-50 transition-colors cursor-pointer group",
                        selectedSale?.id === sale.id && "bg-blue-50/50"
                      )}
                      onClick={() => handleRowClick(sale)}
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#0F172A]">{sale.orderNo}</div>
                        <div className="text-xs text-slate-400 font-mono">{sale.providerRef || 'No Reference'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-[#0F172A]">₱{sale.total.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 rounded-lg">
                          {sale.paymentMethod.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={cn(
                          "rounded-lg",
                          sale.status === "PAID" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        )}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-sm text-slate-600">{format(new Date(sale.createdAt), "MMM dd")}</div>
                        <div className="text-xs text-slate-400">{format(new Date(sale.createdAt), "HH:mm")}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> of <span className="font-medium">{filteredSales.length}</span> results
            </p>
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </Button>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "rounded-lg cursor-pointer",
                        currentPage === page ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:text-white" : "hover:bg-slate-100"
                      )}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1 rounded-lg"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* 🚀 Dynamic Bottom Panel (Collapsible & Transparent) */}
      <AnimatePresence>
        {selectedSale && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ 
              y: isPanelExpanded ? 0 : "calc(100% - 60px)", 
              opacity: 1,
              backgroundColor: isPanelExpanded ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0)" 
            }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 backdrop-blur-md",
              !isPanelExpanded && "border-t-transparent shadow-none"
            )}
          >
            {/* Toggle Handle */}
            <div 
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isPanelExpanded ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm border border-slate-100"
                )}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className={cn(
                    "font-bold transition-all",
                    isPanelExpanded ? "text-[#0F172A]" : "text-slate-400 text-sm"
                  )}>
                    {isPanelExpanded ? `Order ${selectedSale.orderNo}` : "Tap for Details"}
                  </div>
                  {isPanelExpanded && (
                    <div className="text-xs text-slate-500">
                      {format(new Date(selectedSale.createdAt), "MMM dd, yyyy • HH:mm")}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isPanelExpanded && (
                   <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 mr-2">
                     ₱{selectedSale.total.toFixed(2)}
                   </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 hover:bg-slate-200"
                >
                  {isPanelExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </Button>
                {isPanelExpanded && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-slate-200 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSale(null);
                      setIsPanelExpanded(false);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            <div className={cn(
              "px-6 pb-8 max-h-[70vh] overflow-y-auto",
              !isPanelExpanded && "hidden"
            )}>
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                {/* Left: Item List */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Item Breakdown
                  </h3>
                  <div className="space-y-3">
                    {selectedSale.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="font-bold text-[#0F172A]">{item.name}</div>
                            <div className="text-xs text-slate-500">₱{item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                        <div className="font-bold text-[#0F172A]">₱{(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Payment Summary */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Summary</h3>
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Payment Method</span>
                        <span className="font-bold">{selectedSale.paymentMethod.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Status</span>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          {selectedSale.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Provider Ref</span>
                        <span className="font-mono text-xs">{selectedSale.providerRef || "N/A"}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-4 flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-500">Total Amount</span>
                        <span className="text-3xl font-black text-[#0F172A]">₱{selectedSale.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 border-slate-200">
                      <Download className="w-4 h-4" />
                      PDF Receipt
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl gap-2 bg-[#2563EB] hover:bg-[#1D4ED8]">
                      <Receipt className="w-4 h-4" />
                      Print Thermal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}