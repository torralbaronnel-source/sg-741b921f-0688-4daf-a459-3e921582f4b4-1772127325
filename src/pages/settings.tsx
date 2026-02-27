import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/types/pos";
import { INITIAL_SETTINGS } from "@/lib/mock-data";
import { Store, MapPin, Phone, Hash, Receipt, Save, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ShoppingCart, Package, BarChart3, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem("pocketpos_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!settings.shopName || settings.shopName.length < 3) {
      newErrors.shopName = "Shop name must be at least 3 characters.";
    }
    
    if (!settings.address || settings.address.length < 5) {
      newErrors.address = "A valid business address is required.";
    }

    if (!settings.phone || !/^\+?[0-9\s-]{7,15}$/.test(settings.phone)) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (!settings.tin || !/^[0-9]{3}-?[0-9]{3}-?[0-9]{3}-?[0-9]{0,3}$/.test(settings.tin)) {
      newErrors.tin = "TIN must be 9-12 digits (format: 000-000-000-000).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem("pocketpos_settings", JSON.stringify(settings));
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your business profile has been updated.",
      });
    }, 800);
  };

  const updateField = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Clear error as user types
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-24">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Business Settings</h1>
          <p className="text-muted-foreground">Configure your shop profile and receipt standards.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  <CardTitle>Business Profile</CardTitle>
                </div>
                <CardDescription>Official information displayed on your receipts.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shopName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Shop Name</Label>
                    <div className="relative">
                      <Input
                        id="shopName"
                        value={settings.shopName}
                        onChange={(e) => updateField("shopName", e.target.value)}
                        className={`pl-10 h-12 ${errors.shopName ? "border-red-500 ring-red-100" : "border-slate-200"}`}
                        placeholder="e.g. Kapeng Barako Cafe"
                      />
                      <Store className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    </div>
                    {errors.shopName && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.shopName}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Address</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        value={settings.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        className={`pl-10 h-12 ${errors.address ? "border-red-500 ring-red-100" : "border-slate-200"}`}
                        placeholder="e.g. 123 Rizal Ave, Quezon City"
                      />
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    </div>
                    {errors.address && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Number</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={settings.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className={`pl-10 h-12 ${errors.phone ? "border-red-500 ring-red-100" : "border-slate-200"}`}
                          placeholder="0917 123 4567"
                        />
                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      </div>
                      {errors.phone && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.phone}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tin" className="text-xs font-bold uppercase tracking-wider text-slate-500">TIN Number</Label>
                      <div className="relative">
                        <Input
                          id="tin"
                          value={settings.tin}
                          onChange={(e) => updateField("tin", e.target.value)}
                          className={`pl-10 h-12 ${errors.tin ? "border-red-500 ring-red-100" : "border-slate-200"}`}
                          placeholder="000-000-000-000"
                        />
                        <Hash className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      </div>
                      {errors.tin && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.tin}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <CardTitle>Receipt Configuration</CardTitle>
                </div>
                <CardDescription>Select your output style and tax rules.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Receipt Type</Label>
                    <Select 
                      value={settings.receiptType} 
                      onValueChange={(v: "standard" | "complex") => updateField("receiptType", v)}
                    >
                      <SelectTrigger className="h-12 border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (Basic Slip)</SelectItem>
                        <SelectItem value="complex">Complex (Official Receipt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">VAT Rate (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={settings.vatRate}
                        onChange={(e) => updateField("vatRate", parseFloat(e.target.value))}
                        className="pl-10 h-12 border-slate-200"
                      />
                      <Hash className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-[#2563EB] hover:bg-blue-700 text-white h-14 px-10 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex gap-2 transition-all active:scale-95"
              >
                {isSaving ? (
                  <>Saving Changes...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Business Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-blue-100 bg-blue-50/30 overflow-hidden sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-widest">Setup Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${settings.shopName && !errors.shopName ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${settings.shopName && !errors.shopName ? "text-slate-700" : "text-slate-400"}`}>Business Name Set</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${settings.tin && !errors.tin ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${settings.tin && !errors.tin ? "text-slate-700" : "text-slate-400"}`}>Tax ID (TIN) Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${settings.address && !errors.address ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${settings.address && !errors.address ? "text-slate-700" : "text-slate-400"}`}>Location Provided</span>
                </div>

                <div className="pt-4 border-t border-blue-100 mt-2">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter leading-tight">
                    Information provided here will appear on your Official Receipts and tax reports.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Unified Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-50 md:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 py-1 px-3">
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
          </Link>
          <Link href="/pos" className="flex flex-col items-center gap-1 text-slate-400 py-1 px-3">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminal</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-400 py-1 px-3">
            <Package className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Items</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-1 text-blue-600 py-1 px-3 border-t-2 border-blue-600 -mt-[2px]">
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}