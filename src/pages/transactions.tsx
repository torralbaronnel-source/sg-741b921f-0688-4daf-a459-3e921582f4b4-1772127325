import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, Search, Filter, Download, Calendar as CalendarIcon,
  Banknote, CreditCard, QrCode, Smartphone, MoreHorizontal, ChevronDown
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  startOfYear,
  endOfYear,
  isWithinInterval 
} from "date-fns";
import Link from "next/link";
import { Sale, PaymentMethod } from "@/types/pos";

type DateRangeType = 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all';

export default function Transactions() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<DateRangeType>('all');

  useEffect(() => {
    const savedSales = localStorage.getItem("pocketpos_sales");
    if (savedSales) {
      try {
        setSales(JSON.parse(savedSales));
      } catch (e) {
        console.error("Failed to parse sales", e);
        setSales([]);
      }
    }
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // 1. Search Filter
      const matchesSearch = 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.referenceNo?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      // 2. Payment Method Filter
      const matchesMethod = methodFilter === "ALL" || sale.paymentMethod === methodFilter;

      // 3. Date Range Filter
      const saleDate = new Date(sale.timestamp);
      const now = new Date();
      let matchesDate = true;

      switch (dateRange) {
        case 'today':
          matchesDate = isWithinInterval(saleDate, { start: startOfDay(now), end: endOfDay(now) });
          break;
        case '7days':
          matchesDate = isWithinInterval(saleDate, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
          break;
        case '30days':
          matchesDate = isWithinInterval(saleDate, { start: startOfDay(subDays(now, 30)), end: endOfDay(now) });
          break;
        case 'thisMonth':
          matchesDate = isWithinInterval(saleDate, { start: startOfMonth(now), end: endOfMonth(now) });
          break;
        case 'lastMonth':
          const lastMonth = subMonths(now, 1);
          matchesDate = isWithinInterval(saleDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
          break;
        case 'thisYear':
          matchesDate = isWithinInterval(saleDate, { start: startOfYear(now), end: endOfYear(now) });
          break;
        case 'lastYear':
          const lastYear = subDays(startOfYear(now), 1);
          matchesDate = isWithinInterval(saleDate, { start: startOfYear(lastYear), end: endOfYear(lastYear) });
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesMethod && matchesDate;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, searchTerm, methodFilter, dateRange]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const cash = filteredSales.filter(s => s.paymentMethod === 'CASH').reduce((acc, sale) => acc + sale.total, 0);
    const digital = total - cash;
    return { total, cash, digital, count: filteredSales.length };
  }, [filteredSales]);

  const exportToCSV = (range?: DateRangeType) => {
    // If a range is provided from the dropdown, we temporarily filter for that range
    // otherwise we use the current 'filteredSales' which already has search/method/date filters
    let dataToExport = filteredSales;

    if (range && range !== dateRange) {
      // Create a temporary filtered set if the user chose a specific range from the export menu
      dataToExport = sales.filter((sale) => {
        const matchesSearch = 
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.referenceNo?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesMethod = methodFilter === "ALL" || sale.paymentMethod === methodFilter;
        
        const saleDate = new Date(sale.timestamp);
        const now = new Date();
        let matchesDate = true;
        
        switch (range) {
          case 'today': matchesDate = isWithinInterval(saleDate, { start: startOfDay(now), end: endOfDay(now) }); break;
          case '7days': matchesDate = isWithinInterval(saleDate, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) }); break;
          case '30days': matchesDate = isWithinInterval(saleDate, { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }); break;
          case 'thisMonth': matchesDate = isWithinInterval(saleDate, { start: startOfMonth(now), end: endOfMonth(now) }); break;
          case 'lastMonth': {
            const lastMonth = subMonths(now, 1);
            matchesDate = isWithinInterval(saleDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
            break;
          }
          case 'thisYear': matchesDate = isWithinInterval(saleDate, { start: startOfYear(now), end: endOfYear(now) }); break;
          case 'lastYear': {
            const lastYear = subDays(startOfYear(now), 1);
            matchesDate = isWithinInterval(saleDate, { start: startOfYear(lastYear), end: endOfYear(lastYear) });
            break;
          }
          default: matchesDate = true;
        }
        return matchesSearch && matchesMethod && matchesDate;
      }).sort((a, b) => b.timestamp - a.timestamp);
    }

    if (dataToExport.length === 0) return;

    const headers = [
      "Order ID", "Date", "Time", "Items Summary", "Payment Method", "Ref No", 
      "Subtotal", "Tax", "Discount", "Grand Total"
    ];

    const rows = dataToExport.map(sale => [
      `#${sale.id}`,
      format(sale.timestamp, "yyyy-MM-dd"),
      format(sale.timestamp, "HH:mm:ss"),
      sale.items.map(i => `${i.name} (x${i.quantity})`).join(" | "),
      sale.paymentMethod.replace('_', ' '),
      sale.referenceNo || "N/A",
      sale.subtotal.toFixed(2),
      sale.taxTotal.toFixed(2),
      sale.discountTotal.toFixed(2),
      sale.total.toFixed(2)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `PocketPOS_Export_${range || dateRange}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRangeLabel = (range: DateRangeType) => {
    const labels: Record<DateRangeType, string> = {
      today: "Today",
      '7days': "Last 7 Days",
      '30days': "Last 30 Days",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      thisYear: "This Year",
      lastYear: "Last Year",
      all: "All Time"
    };
    return labels[range];
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20">
      <SEO title="Transactions - PocketPOS PH" />
      
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-[#0F172A]">Transactions</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Current Filters</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportToCSV()}>
                <Download className="mr-2 h-4 w-4" />
                Current View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Export by Preset</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportToCSV('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('7days')}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('30days')}>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('thisMonth')}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('lastMonth')}>Last Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('thisYear')}>This Year</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV('lastYear')}>Last Year</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportToCSV('all')} className="font-bold">Full History (All Time)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue ({getRangeLabel(dateRange)})</p>
              <p className="text-2xl font-bold text-[#0F172A] mt-1">₱{stats.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cash on Hand</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₱{stats.cash.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Digital/Card</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₱{stats.digital.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sales Count</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.count}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Order ID or Ref No..." 
              className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {(['ALL', 'CASH', 'GCASH_MAYA', 'MAYA_TERMINAL', 'CARD'] as const).map((method) => (
              <Button
                key={method}
                variant={methodFilter === method ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap"
                onClick={() => setMethodFilter(method)}
              >
                {method === 'ALL' ? 'All' : method.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium text-[#0F172A]">#{sale.id}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(sale.timestamp, "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-[10px] uppercase">
                        {sale.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0F172A]">
                      ₱{sale.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}