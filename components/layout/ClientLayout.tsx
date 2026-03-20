"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { MobileTabBar } from "./MobileTabBar";
import { Toaster } from "@/components/ui/sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-20 pt-16 h-full overflow-hidden relative transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative z-0">
          {children}
        </main>
        <Toaster />
        <MobileTabBar onOpenMenu={() => setIsMenuOpen(true)} />
      </div>
    </div>
  );
}
