import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Building2, Receipt, Percent, Globe } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/types/pos";
import { INITIAL_SETTINGS } from "@/lib/mock-data";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("pocketpos_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("pocketpos_settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Business profile and receipt configuration updated.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="receipt">Receipt Config</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <CardTitle>Shop Information</CardTitle>
                </div>
                <CardDescription>Configure your business identity for receipts and reports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input 
                    id="shopName" 
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tin">TIN (Tax Identification Number)</Label>
                  <Input 
                    id="tin" 
                    placeholder="000-000-000-000"
                    value={settings.tin}
                    onChange={(e) => setSettings({ ...settings, tin: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <CardTitle>Regional & Currency</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Currency Symbol</Label>
                  <Select 
                    value={settings.currency}
                    onValueChange={(v) => setSettings({ ...settings, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">₱ (PHP)</SelectItem>
                      <SelectItem value="USD">$ (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <CardTitle>Receipt Style</CardTitle>
                </div>
                <CardDescription>Control how your physical and digital receipts are generated.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Layout Type</Label>
                  <Select 
                    value={settings.receiptType}
                    onValueChange={(v: "standard" | "complex") => setSettings({ ...settings, receiptType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Compact)</SelectItem>
                      <SelectItem value="complex">Enterprise (Full BIR Style)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label>Show VAT Breakdown</Label>
                    <p className="text-xs text-slate-500">Calculate and display 12% VAT on receipts.</p>
                  </div>
                  <Switch 
                    checked={settings.showVat}
                    onCheckedChange={(v) => setSettings({ ...settings, showVat: v })}
                  />
                </div>

                {settings.showVat && (
                  <div className="grid gap-2">
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input 
                      id="vatRate" 
                      type="number"
                      value={settings.vatRate}
                      onChange={(e) => setSettings({ ...settings, vatRate: parseFloat(e.target.value) })}
                    />
                  </div>
                )}

                <div className="grid gap-2 pt-2">
                  <Label htmlFor="header">Receipt Header Message</Label>
                  <Input 
                    id="header" 
                    placeholder="e.g. THANK YOU!"
                    value={settings.receiptHeader}
                    onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="footer">Receipt Footer (Legal/TOS)</Label>
                  <Textarea 
                    id="footer" 
                    rows={4}
                    placeholder="e.g. This serves as an Official Receipt..."
                    value={settings.receiptFooter}
                    onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 text-slate-400">
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
        </Link>
        <Link href="/pos" className="flex flex-col items-center gap-1 text-slate-400">
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">POS</span>
        </Link>
        <Link href="/inventory" className="flex flex-col items-center gap-1 text-slate-400">
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Items</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-blue-600">
          <Save className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
        </Link>
      </div>
    </div>
  );
}