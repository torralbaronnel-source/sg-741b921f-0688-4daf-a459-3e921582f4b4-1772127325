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
  Info,
  ImagePlus,
  Save,
  LogOut,
  Camera,
  Badge,
  UploadCloud
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

const TRANSACTION_LIMIT = 100;

const INITIAL_SETTINGS: StoreSettings = {
  storeName: "PocketPOS PH",
  address: "Metro Manila, Philippines",
  phone: "+63 900 000 0000",
  receiptFooter: "Salamat sa pagtangkilik!",
  lowStockThreshold: 10,
  autoPrintReceipt: true,
  enableVat: true,
  subscriptionTier: "FREE",
  monthlyTransactionCount: 0,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 1MB to prevent localStorage strain
    if (file.size > 1024 * 1024) {
      alert("Logo is too large. Please use an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (settings) {
        const updatedSettings = { ...settings, storeLogo: base64String };
        setSettings(updatedSettings);
        localStorage.setItem("pocketpos_settings", JSON.stringify(updatedSettings));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    if (settings) {
      const updatedSettings = { ...settings, storeLogo: undefined };
      setSettings(updatedSettings);
      localStorage.setItem("pocketpos_settings", JSON.stringify(updatedSettings));
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("pos_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem("pos_settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const updateSetting = (key: keyof StoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const usagePercent = settings ? Math.min((settings.monthlyTransactionCount / TRANSACTION_LIMIT) * 100, 100) : 0;

  if (!isLoaded) return null;

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
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {settings?.storeLogo ? (
                      <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  {settings?.storeLogo && (
                    <button 
                      onClick={removeLogo}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-slate-800 block mb-1">Store Logo</Label>
                  <p className="text-xs text-slate-500 mb-3">Square PNG or JPG (Max 1MB)</p>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <Button variant="outline" size="sm" className="w-full border-slate-200 bg-white text-slate-700 font-medium">
                      <UploadCloud className="w-3.5 h-3.5 mr-2" />
                      {settings?.storeLogo ? "Change Logo" : "Upload Logo"}
                    </Button>
                  </div>
                </div>
              </div>

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