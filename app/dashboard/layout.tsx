"use client";

import React, { createContext, useContext, useState, Suspense } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import AdminSecurityModal from "@/components/dashboard/AdminSecurityModal";
import { logoutAction } from "@/actions/auth-actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type DashboardViewType =
  | "cards"
  | "departments"
  | "analytics";

interface DashboardNavContextType {
  currentView: DashboardViewType;
  setCurrentView: (view: DashboardViewType) => void;
  analyticsCardId: string | null;
  setAnalyticsCardId: (id: string | null) => void;
  openAnalytics: (cardId?: string) => void;
  openSecurityModal: () => void;
}

export const DashboardNavContext = createContext<DashboardNavContextType>({
  currentView: "cards",
  setCurrentView: () => {},
  analyticsCardId: null,
  setAnalyticsCardId: () => {},
  openAnalytics: () => {},
  openSecurityModal: () => {},
});

export const useDashboardNav = () => useContext(DashboardNavContext);

function DashboardNavContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL-driven navigation state (preserves view on reload & supports browser Back/Forward)
  const viewParam = searchParams.get("view");
  const currentView: DashboardViewType =
    viewParam === "analytics" || viewParam === "departments" ? viewParam : "cards";
  const analyticsCardId = searchParams.get("card") || null;

  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const setCurrentView = (view: DashboardViewType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "cards") {
      params.delete("view");
      params.delete("card");
    } else {
      params.set("view", view);
      if (view !== "analytics") {
        params.delete("card");
      }
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const openAnalytics = (cardId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "analytics");
    if (cardId) {
      params.set("card", cardId);
    } else {
      params.delete("card");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setAnalyticsCardId = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "analytics");
    if (id) {
      params.set("card", id);
    } else {
      params.delete("card");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <DashboardNavContext.Provider
      value={{
        currentView,
        setCurrentView,
        analyticsCardId,
        setAnalyticsCardId,
        openAnalytics,
        openSecurityModal: () => setSecurityModalOpen(true),
      }}
    >
      <div className="relative min-h-screen bg-[#F8F9FA] text-[#0F172A] flex font-sans">
        {/* Executive Corporate Sidebar - Royal Feather Glassmorphism */}
        <aside className="relative z-10 w-64 bg-[#020b18] border-r border-slate-900/10 p-6 flex flex-col justify-between select-none text-white shadow-2xl min-h-screen shrink-0 sticky top-0 h-screen overflow-hidden">
          {/* Ambient Feather Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-35">
            <picture>
              <source srcSet="/card-bg.webp" type="image/webp" />
              <img
                src="/card-bg.jpg"
                alt=""
                className="w-full h-full object-cover object-left scale-110"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/70 via-[#020b18]/85 to-[#020b18]/95" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Brand Logo & Console Tag */}
            <div className="space-y-3 pb-3 border-b border-white/10">
              <div className="flex items-center">
                <img
                  src="/reach-world-logo.png"
                  alt="Reach World"
                  className="h-8 w-auto object-contain brightness-0 invert drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span>Fleet Console</span>
                <span className="text-[10px] text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full border border-white/15 backdrop-blur-sm">
                  50 NFC Cards
                </span>
              </div>
            </div>

            {/* Navigation Items - Glassmorphic Badges */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setCurrentView("cards")}
                className={`relative overflow-hidden w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === "cards"
                    ? "bg-white/[0.12] text-white font-semibold border border-white/[0.18] shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-white before:rounded-r"
                    : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                }`}
              >
                50 Cards Registry
              </button>

              <button
                onClick={() => setCurrentView("departments")}
                className={`relative overflow-hidden w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === "departments"
                    ? "bg-white/[0.12] text-white font-semibold border border-white/[0.18] shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-white before:rounded-r"
                    : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                }`}
              >
                Departments
              </button>

              <button
                onClick={() => openAnalytics()}
                className={`relative overflow-hidden w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentView === "analytics"
                    ? "bg-white/[0.12] text-white font-semibold border border-white/[0.18] shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-white before:rounded-r"
                    : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                }`}
              >
                Clicks & Analytics
              </button>

              <div className="pt-4 pb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3.5 mb-2">
                  Security & Admin
                </div>
                <button
                  onClick={() => setSecurityModalOpen(true)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium transition-all cursor-pointer"
                >
                  Security & Account
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom Section - Glassmorphic Actions */}
          <div className="relative z-10 space-y-2 pt-4 border-t border-white/10">
            <a
              href="https://reachworld.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block px-3.5 py-2 rounded-xl text-[11px] text-slate-300/75 hover:text-white hover:bg-white/[0.06] border border-transparent transition-all font-medium"
            >
              reachworld.com
            </a>

            <button
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2 rounded-xl text-[11px] text-slate-300/75 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer font-medium"
            >
              Sign Out
            </button>

            <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="font-semibold text-slate-200">Fleet Active</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Slots 01-50</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>

        {/* Security & Credentials Modal */}
        <AdminSecurityModal
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
        />
      </div>
    </DashboardNavContext.Provider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopOnlyGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]" />}>
        <DashboardNavContent>{children}</DashboardNavContent>
      </Suspense>
    </DesktopOnlyGuard>
  );
}
