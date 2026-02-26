import React from "react";
import { SEO } from "@/components/SEO";
import { 
  ArrowLeft, 
  Store, 
  User, 
  Bell, 
  ShieldCheck, 
  Smartphone,
  Info,
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const sections = [
    {
      title: "Business Profile",
      items: [
        { icon: <Store className="w-5 h-5" />, label: "Store Information", value: "Juan's Sari-Sari Store" },
        { icon: <User className="w-5 h-5" />, label: "Staff Management", value: "3 Staff" },
      ]
    },
    {
      title: "App Settings",
      items: [
        { icon: <Bell className="w-5 h-5" />, label: "Notifications", value: "On" },
        { icon: <ShieldCheck className="w-5 h-5" />, label: "Security & PIN", value: "Enabled" },
        { icon: <Smartphone className="w-5 h-5" />, label: "Receipt Printer", value: "Bluetooth (Not Linked)" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: <Info className="w-5 h-5" />, label: "App Version", value: "v1.0.4-PH" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEO title="Settings | PocketPOS PH" />
      
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="flex items-center space-x-4 max-w-lg mx-auto w-full">
          <Link href="/" className="p-2 -ml-2 text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold flex-1">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {section.items.map((item, i) => (
                <button 
                  key={i} 
                  className="w-full p-4 flex items-center justify-between border-b last:border-0 border-slate-50 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-400">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                      <p className="text-slate-400 text-xs">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full p-4 bg-white rounded-2xl border border-red-50 text-red-500 font-bold flex items-center justify-center space-x-2 active:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        <p className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-8">
          PocketPOS PH © 2026
        </p>
      </main>
    </div>
  );
}