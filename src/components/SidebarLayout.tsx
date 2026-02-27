import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "POS Terminal", href: "/pos" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: History, label: "Transactions", href: "/transactions" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#CBD5E1] flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-[#CBD5E1]">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              PocketPOSPh
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-6 h-auto transition-all",
                  router.pathname === item.href 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-[#475569] hover:bg-[#F5F6F8]"
                )}
              >
                <item.icon className={cn("w-5 h-5", router.pathname === item.href ? "text-blue-600" : "text-[#475569]")} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#CBD5E1]">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 px-3">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-[#CBD5E1] p-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <h1 className="text-xl font-bold text-[#0F172A]">PocketPOSPh</h1>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-6 h-auto",
                      router.pathname === item.href ? "bg-blue-50 text-blue-600 font-semibold" : "text-[#475569]"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 p-3 mt-4">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}