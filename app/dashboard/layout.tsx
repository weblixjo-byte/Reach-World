"use client";

import React, { createContext, useContext, useState } from "react";
import {
  CreditCard,
  BarChart3,
  Users,
  FileSpreadsheet,
} from "lucide-react";

export type DashboardViewType =
  | "cards"
  | "analytics"
  | "departments"
  | "bulk_tools";

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
    <DashboardNavContext.Provider value={{ currentView, setCurrentView }}>
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans">
        {/* Mobile Top Navigation Bar (visible < lg) */}
        <header className="lg:hidden bg-[#0a192f] text-white border-b border-[#1e293b] sticky top-0 z-40 shadow-md">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]/60">
            <img
              src="/reach-world-logo.png"
              alt="Reach World"
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          {/* Mobile Horizontal Tab Navigation */}
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCurrentView("cards")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                currentView === "cards"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#112240]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setCurrentView("analytics")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                currentView === "analytics"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#112240]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentView("departments")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                currentView === "departments"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#112240]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Departments</span>
            </button>

            <button
              onClick={() => setCurrentView("bulk_tools")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                currentView === "bulk_tools"
                  ? "bg-[#1E3A8A] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#112240]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Batch Excel</span>
            </button>
          </div>
        </header>

        {/* Desktop Sidebar: #0a192f with Company Logo at Bottom (hidden on mobile, visible on lg) */}
        <aside className="hidden lg:flex w-64 bg-[#0a192f] border-r border-[#1e293b] p-5 flex-col justify-between select-none text-white shadow-xl min-h-screen shrink-0 sticky top-0 h-screen">
          <div className="space-y-6">
            {/* Top Window Control Dots (Clean) */}
            <div className="flex items-center gap-2 px-1">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5 pt-2">
              <button
                onClick={() => setCurrentView("cards")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  currentView === "cards"
                    ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards Registry</span>
              </button>

              <button
                onClick={() => setCurrentView("analytics")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  currentView === "analytics"
                    ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setCurrentView("departments")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  currentView === "departments"
                    ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Departments</span>
              </button>

              <button
                onClick={() => setCurrentView("bulk_tools")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  currentView === "bulk_tools"
                    ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Batch Excel (CSV)</span>
              </button>
            </nav>
          </div>

          {/* Bottom Company Official Logo Container */}
          <div className="pt-5 pb-2 border-t border-[#1e293b]/80 flex items-center justify-center">
            <img
              src="/reach-world-logo.png"
              alt="Reach World"
              className="w-28 h-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </DashboardNavContext.Provider>
  );
}
