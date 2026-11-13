"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import AdminSecurityModal from "@/components/dashboard/AdminSecurityModal";
import { logoutAction } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentView, setCurrentView] = useState<DashboardViewType>("cards");
  const [analyticsCardId, setAnalyticsCardId] = useState<string | null>(null);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const router = useRouter();

  const openAnalytics = (cardId?: string) => {
    setAnalyticsCardId(cardId || null);
    setCurrentView("analytics");
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <DesktopOnlyGuard>
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
                  <span className="text-[10px] text-sky-300 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-400/25 backdrop-blur-sm">
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
                      ? "bg-white/[0.10] text-white font-semibold border border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-sky-400 before:rounded-r"
                      : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] font-medium backdrop-blur-sm"
                  }`}
                >
                  50 Cards Registry
                </button>

                <button
                  onClick={() => setCurrentView("departments")}
                  className={`relative overflow-hidden w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentView === "departments"
                      ? "bg-white/[0.10] text-white font-semibold border border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-sky-400 before:rounded-r"
                      : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] font-medium backdrop-blur-sm"
                  }`}
                >
                  Departments
                </button>

                <button
                  onClick={() => openAnalytics()}
                  className={`relative overflow-hidden w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentView === "analytics"
                      ? "bg-white/[0.10] text-white font-semibold border border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-sky-400 before:rounded-r"
                      : "text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] font-medium backdrop-blur-sm"
                  }`}
                >
                  Clicks & Analytics
                </button>

                <div className="pt-4 pb-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400/70 px-3.5 mb-2">
                    Security & Admin
                  </div>
                  <button
                    onClick={() => setSecurityModalOpen(true)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs text-slate-300/80 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] font-medium transition-all cursor-pointer backdrop-blur-sm"
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
                className="w-full block px-3.5 py-2 rounded-xl text-[11px] text-slate-300/75 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all font-medium"
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
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
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
    </DesktopOnlyGuard>
  );
}
