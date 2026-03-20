"use client";

import { Home, Layers, CreditCard, Wallet, Settings, Clock, LineChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Layers, label: "Decisions", href: "/decisions" },
  { icon: CreditCard, label: "Subscriptions", href: "/subscriptions" },
  { icon: Wallet, label: "Expenses", href: "/expenses" },
  { icon: Clock, label: "History", href: "/history" },
  { icon: LineChart, label: "Insights", href: "/insights" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-20 flex flex-col items-center py-8 bg-white border-r border-gray-100", className)}>
      <div className="mb-8">
        <Link href="/" className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg">
          D
        </Link>
      </div>
      
      <nav className="flex-1 flex flex-col gap-4 w-full px-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 mx-auto",
                isActive 
                  ? "text-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-100" 
                  : "text-gray-400 hover:text-blue-600 hover:bg-gray-50"
              )}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 w-full px-2 mb-4">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 mx-auto",
                isActive 
                  ? "text-gray-900 bg-gray-100 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={2} />
            </Link>
          );
        })}
        <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mt-2 overflow-hidden border-2 border-white shadow-sm">
            {/* Placeholder for user avatar */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
        </div>
      </div>
    </aside>
  );
}
