"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import AdminSecurityModal from "@/components/dashboard/AdminSecurityModal";
import { logoutAction } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";

export type DashboardViewType =
  | "cards"
  | "departments";

interface DashboardNavContextType {
  currentView: DashboardViewType;
  setCurrentView: (view: DashboardViewType) => void;
  openSecurityModal: () => void;
}

export const DashboardNavContext = createContext<DashboardNavContextType>({
  currentView: "cards",
  setCurrentView: () => {},
  openSecurityModal: () => {},
});

export const useDashboardNav = () => useContext(DashboardNavContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentView, setCurrentView] = useState<DashboardViewType>("cards");
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const router = useRouter();

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
          openSecurityModal: () => setSecurityModalOpen(true),
        }}
      >
        <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
          {/* Executive Corporate Sidebar - Muted, formal, zero neon */}
          <aside className="w-64 bg-[#0a192f] border-r border-slate-800 p-6 flex flex-col justify-between select-none text-white shadow-lg min-h-screen shrink-0 sticky top-0 h-screen">
            <div className="space-y-6">
              {/* Old Original Brand Logo */}
              <div className="space-y-3 pb-2 border-b border-white/10">
                <div className="flex items-center">
                  <img
                    src="/reach-world-logo.png"
                    alt="Reach World"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Fleet Console</span>
                  <span className="text-[10px] text-slate-300 font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    50 NFC Cards
                  </span>
                </div>
              </div>

              {/* Navigation Items - Pure Clean Typography, Zero Icons */}
              <nav className="space-y-1">
                <button
                  onClick={() => setCurrentView("cards")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                    currentView === "cards"
                      ? "bg-white/10 text-white font-semibold border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  50 Cards Registry
                </button>

                <button
                  onClick={() => setCurrentView("departments")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                    currentView === "departments"
                      ? "bg-white/10 text-white font-semibold border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  Departments
                </button>

                <div className="pt-4 pb-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3.5 mb-1.5">
                    Security & Admin
                  </div>
                  <button
                    onClick={() => setSecurityModalOpen(true)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-all cursor-pointer"
                  >
                    Security & Account
                  </button>
                </div>
              </nav>
            </div>

            {/* Bottom Section - Formal, Zero Icons, Zero Neon */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <a
                href="https://reachworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block px-3.5 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                reachworld.com
              </a>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 rounded-lg text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer font-medium"
              >
                Sign Out
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                <span className="font-medium text-slate-400">Fleet Active</span>
                <span className="text-[10px] text-slate-400">Slots 01-50</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-10">{children}</main>

          {/* Security & Credentials Modal */}
          <AdminSecurityModal
            isOpen={securityModalOpen}
            onClose={() => setSecurityModalOpen(false)}
            onAnalyticsReset={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          />
        </div>
      </DashboardNavContext.Provider>
    </DesktopOnlyGuard>
  );
}
