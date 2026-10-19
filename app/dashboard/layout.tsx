import React from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import {
  CreditCard,
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopOnlyGuard>
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
        {/* macOS Style Window Frame Bar */}
        <header className="h-10 bg-white/70 backdrop-blur-md border-b border-black/[0.06] px-4 flex items-center justify-between select-none sticky top-0 z-40">
          <div className="flex items-center gap-2">
            {/* Traffic Lights */}
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition-opacity cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 transition-opacity cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 transition-opacity cursor-pointer" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1D1D1F]">Reach World</span>
              <span className="text-black/20 text-xs">/</span>
              <span className="text-xs text-[#86868B]">Bio & NFC Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#34C759]/10 text-[#34C759]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
              Vercel Edge Ready
            </span>
          </div>
        </header>

        {/* Dashboard Shell with Left Frosted Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Frosted Sidebar */}
          <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-black/[0.06] p-5 flex flex-col justify-between select-none">
            <div className="space-y-6">
              {/* App Brand */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm">
                  <CreditCard className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#1D1D1F] tracking-tight">
                    REACH WORLD
                  </h2>
                  <p className="text-[10px] text-[#86868B] uppercase tracking-wider">
                    Enterprise SaaS
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium bg-[#0071E3] text-white shadow-xs transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards Registry</span>
                </Link>

                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition-colors cursor-pointer"
                  title="Coming in Enterprise Pro"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4" />
                    <span>Edge Analytics</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 text-[#86868B]">
                    Live
                  </span>
                </div>

                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition-colors cursor-pointer"
                  title="Filter and group by departments in table"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Departments</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 text-[#86868B]">
                    Auto
                  </span>
                </div>

                <div
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition-colors cursor-pointer"
                  title="Settings & Integrations"
                >
                  <Settings className="w-4 h-4" />
                  <span>System Settings</span>
                </div>
              </nav>
            </div>

            {/* Bottom System Info Widget */}
            <div className="p-3.5 bg-[#F5F5F7] rounded-2xl border border-black/[0.04]">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  NFC Cloud v2.5
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] leading-tight">
                Synced with MongoDB Atlas & Vercel Edge ISR Cache.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </DesktopOnlyGuard>
  );
}
