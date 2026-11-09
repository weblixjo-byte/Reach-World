"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import {
  CreditCard,
  BarChart3,
  Users,
  FileSpreadsheet,
} from "lucide-react";

export type DashboardViewType =
  | "cards"
  | "departments";

interface DashboardNavContextType {
  currentView: DashboardViewType;
  setCurrentView: (view: DashboardViewType) => void;
}

export const DashboardNavContext = createContext<DashboardNavContextType>({
  currentView: "cards",
  setCurrentView: () => {},
});

export const useDashboardNav = () => useContext(DashboardNavContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentView, setCurrentView] = useState<DashboardViewType>("cards");

  return (
    <DesktopOnlyGuard>
      <DashboardNavContext.Provider value={{ currentView, setCurrentView }}>
        <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
          {/* Executive Corporate Sidebar: #0a192f */}
          <aside className="w-64 bg-[#0a192f] border-r border-[#1e293b] p-6 flex flex-col justify-between select-none text-white shadow-xl min-h-screen shrink-0 sticky top-0 h-screen">
            <div className="space-y-7">
              {/* Official Brand Header at the Top */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/reach-world-logo.png"
                    alt="Reach World"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-medium pt-1 border-t border-white/10">
                  <span>Fleet Console</span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    50 NFC Cards
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setCurrentView("cards")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentView === "cards"
                      ? "bg-[#0071E3] text-white font-bold shadow-md shadow-[#0071E3]/25"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>50 Cards Registry</span>
                </button>

                <button
                  onClick={() => setCurrentView("departments")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentView === "departments"
                      ? "bg-[#0071E3] text-white font-bold shadow-md shadow-[#0071E3]/25"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Departments</span>
                </button>
              </nav>
            </div>

            {/* Bottom System Status */}
            <div className="pt-4 pb-1 border-t border-white/10 flex items-center justify-between text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                <span className="font-medium text-slate-300">Fleet Active</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Slots 01-50</span>
            </div>
          </aside>

          {/* Main Content Area without Top Bar */}
          <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
      </DashboardNavContext.Provider>
    </DesktopOnlyGuard>
  );
}
