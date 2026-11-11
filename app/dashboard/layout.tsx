"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import AdminSecurityModal from "@/components/dashboard/AdminSecurityModal";
import { logoutAction } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Users,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";

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
          {/* Executive Corporate Sidebar: #0a192f */}
          <aside className="w-64 bg-[#0a192f] border-r border-[#1e293b] p-6 flex flex-col justify-between select-none text-white shadow-xl min-h-screen shrink-0 sticky top-0 h-screen">
            <div className="space-y-7">
              {/* Official Brand Header at the Top */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/branding/reach-world-white.jpg"
                    alt="Reach World"
                    width={150}
                    height={40}
                    className="h-8 w-auto object-contain brightness-110"
                    priority
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-medium pt-1 border-t border-white/10">
                  <span>Fleet Console</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
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

                <div className="pt-3 pb-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3.5 mb-1.5">
                    Security & Admin
                  </div>
                  <button
                    onClick={() => setSecurityModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 font-medium transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security & Account</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Bottom Actions & Status */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <a
                href="https://reachworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>reachworld.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                  <span className="font-medium text-slate-300">Fleet Active</span>
                </div>
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
          />
        </div>
      </DashboardNavContext.Provider>
    </DesktopOnlyGuard>
  );
}
