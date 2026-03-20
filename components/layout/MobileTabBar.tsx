"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Wallet, CreditCard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileNav } from "./MobileNav"; // Reuse MobileNav logic for the "More" menu? 
// Actually MobileNav is a button + drawer. We can reuse the Drawer logic if we export it differently.
// Or we just build a simple "More" menu here.

export function MobileTabBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  const tabs = [
    { icon: Home, label: "首页", href: "/" },
    { icon: Layers, label: "决策", href: "/decisions" },
    { icon: Wallet, label: "支出", href: "/expenses" },
    { icon: CreditCard, label: "订阅", href: "/subscriptions" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-safe z-40 md:hidden flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors",
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
      
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center gap-1 min-w-[3.5rem] text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Menu size={24} strokeWidth={2} />
        <span className="text-[10px] font-medium">更多</span>
      </button>
    </div>
  );
}
