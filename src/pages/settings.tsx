import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { 
  Store, 
  Receipt, 
  Bell, 
  ShieldCheck, 
  Download, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  History,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { StoreSettings, SubscriptionTier } from "@/types/pos";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "PocketPOS Coffee",
  address: "123 Mabini St, Manila",
  phone: "09123456789",
  taxRate: 12,
  currency: "PHP",
  receiptFooter: "Thank you for your purchase!",
  lowStockThreshold: 5,
  autoPrintReceipt: true,
  enableVat: true,
  subscriptionTier: "FREE",
  monthlyTransactionCount: 124,
};

const TRANSACTION_LIMIT = 500;

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("pocketpos_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("pocketpos_settings", JSON.stringify(settings));
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your business configuration has been updated.",
      });
    }, 600);
  };

  const updateSetting = (key: keyof StoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const usagePercent = (settings.monthlyTransactionCount / TRANSACTION_LIMIT) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <SEO title="Settings - PocketPOS PH" />

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Command Center</h1>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="rounded-full px-6 bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        
        {/* Subscription Plan Card */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Plan</h2>
            <Badge className={settings.subscriptionTier === "BASIC" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}>
              {settings.subscriptionTier}
            </Badge>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-900">
                    {settings.subscriptionTier === "FREE" ? "PocketPOS Lite" : "PocketPOS Pro"}
                  </div>
                  <p className="text-sm text-slate-500">
                    {settings.subscriptionTier === "FREE" ? "500 Transactions/mo • No Export" : "Unlimited Transactions • Full Export"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-primary">
                    {settings.subscriptionTier === "FREE" ? "FREE" : "₱49/mo"}
                  </div>
                  <Button variant="link" className="h-auto p-0 text-xs font-bold text-blue-600">
                    {settings.subscriptionTier === "FREE" ? "Upgrade to Pro" : "Manage Billing"}
                  </Button>
                </div>
              </div>
              
              {settings.subscriptionTier === "FREE" && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Monthly Usage</span>
                    <span className={usagePercent > 80 ? "text-amber-600" : "text-slate-700"}>
                      {settings.monthlyTransactionCount} / {TRANSACTION_LIMIT}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2 bg-slate-100" />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Store Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Store className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Info</h2>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Store Name</Label>
                <Input 
                  value={settings.storeName} 
                  onChange={(e) => updateSetting("storeName", e.target.value)}
                  className="rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Contact Number</Label>
                <Input 
                  value={settings.phone} 
                  onChange={(e) => updateSetting("phone", e.target.value)}
                  className="rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all h-12"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* POS Behavior */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operations</h2>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-700">Calculate 12% VAT</Label>
                  <p className="text-xs text-slate-400">Included in receipt total</p>
                </div>
                <Switch 
                  checked={settings.enableVat}
                  onCheckedChange={(v) => updateSetting("enableVat", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-700">Show Stock Badges</Label>
                  <p className="text-xs text-slate-400">Alert me when below {settings.lowStockThreshold}</p>
                </div>
                <Switch 
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Receipt Footer</Label>
                <Input 
                  value={settings.receiptFooter} 
                  onChange={(e) => updateSetting("receiptFooter", e.target.value)}
                  className="rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all h-12"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Tools */}
        <div className="pt-4 pb-12 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between h-14 px-5 rounded-2xl border-slate-200 bg-white shadow-none group"
            onClick={() => {
              if (settings.subscriptionTier === "FREE") {
                toast({
                  title: "Upgrade Required",
                  description: "Export is only available on the Basic plan (₱49/mo).",
                  variant: "destructive"
                });
              }
            }}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">Download Sales (CSV)</span>
            </div>
            {settings.subscriptionTier === "FREE" && <ShieldCheck className="w-4 h-4 text-amber-500" />}
          </Button>
          
          <Button variant="ghost" className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold gap-2">
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </Button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">PocketPOS Philippines</p>
          <p className="text-[10px] text-slate-300 font-medium">Stable Build v1.4.2 • Mobile-First Engine</p>
        </div>
      </main>

      {/* Persistent Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t px-8 py-4 flex justify-between items-center z-50">
        <Link href="/" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Store className="w-6 h-6" /></Link>
        <Link href="/pos" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Receipt className="w-6 h-6" /></Link>
        <Link href="/transactions" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><History className="w-6 h-6" /></Link>
        <Link href="/settings" className="p-2 text-blue-600 bg-blue-50 rounded-xl"><ShieldCheck className="w-6 h-6" /></Link>
      </nav>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </span>
  );
}