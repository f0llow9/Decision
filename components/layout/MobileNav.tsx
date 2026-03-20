"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, Layers, CreditCard, Wallet, Settings, Clock, LineChart } from "lucide-react";
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

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg shadow-blue-200 shadow-md">
              D
            </div>
            <span>Decision</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-gray-900 bg-gray-100 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
               <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
            </div>
            <div className="text-sm font-medium text-gray-700">User</div>
          </div>
        </div>
      </div>
    </>
  );
}
