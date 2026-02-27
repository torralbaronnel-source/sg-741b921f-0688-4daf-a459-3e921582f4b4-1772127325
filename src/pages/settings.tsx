import React, { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2, Building2, MapPin, Hash, Tag, Globe, Laptop } from "lucide-react";
import Link from "next/link";
import { AppSettings, Category } from "@/types/pos";
import { INITIAL_SETTINGS } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-1", name: "COFFEE", emoji: "☕", color: "#7C2D12" },
    { id: "cat-2", name: "PASTRY", emoji: "🥐", color: "#92400E" },
    { id: "cat-3", name: "MERCH", emoji: "👕", color: "#2563EB" },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("pos_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem("pos_settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Business configuration has been updated successfully.",
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      emoji: "📁",
      color: "#2563EB"
    };
    const updated = { ...settings, categories: [...(settings?.categories || []), cat] };
    setSettings(updated);
    setNewCategoryName("");
  };

  const removeCategory = (id: string) => {
    const updated = { ...settings, categories: (settings?.categories || []).filter(c => c.id !== id) };
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SEO title="Business Settings - PocketPOS PH" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1">Settings</h1>
        <Button className="h-9 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Business Profile */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Business Profile
            </CardTitle>
            <CardDescription>Update your shop details for receipts and reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Laptop className="w-3 h-3" /> Shop Name
                </label>
                <Input 
                  value={settings.shopName} 
                  onChange={(e) => setSettings({...settings, shopName: e.target.value})}
                  className="border-slate-200 focus:border-slate-400 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3" /> TIN Number
                </label>
                <Input 
                  value={settings.tin} 
                  onChange={(e) => setSettings({...settings, tin: e.target.value})}
                  className="border-slate-200 focus:border-slate-400 h-11 font-mono"
                  placeholder="000-000-000-000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address
              </label>
              <Input 
                value={settings.shopAddress} 
                onChange={(e) => setSettings({...settings, shopAddress: e.target.value})}
                className="border-slate-200 focus:border-slate-400 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" /> Dynamic Categories
            </CardTitle>
            <CardDescription>Manage the product categories available in your POS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Enter category name (e.g. Signature Coffee)" 
                className="h-11 border-slate-200"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} className="bg-[#0F172A] hover:bg-slate-800 h-11 px-6 shrink-0">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {(settings?.categories || []).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <span className="font-bold text-slate-700">{cat.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeCategory(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-bold text-blue-900">Multi-Terminal Sync</div>
            <p className="text-blue-700 text-sm leading-relaxed">
              These settings are synced locally. Connecting to Supabase will enable real-time synchronization across all your tablets and phones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}