"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Laptop, ArrowRight } from "lucide-react";

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export default function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // During SSR or first render tick, render neutral container to prevent hydration flash
  if (isDesktop === null) {
    return <div className="min-h-screen bg-[#F5F5F7]" />;
  }

  if (!isDesktop) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5F7] flex items-center justify-center p-6 text-[#1D1D1F]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.06] text-center flex flex-col items-center">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 mb-8">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] mb-6">
            <Monitor className="w-8 h-8 stroke-[1.75]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#86868B] mb-3">
            macOS Sequoia & Windows Pro
          </span>

          <h1 className="text-xl font-semibold tracking-tight text-[#1D1D1F] mb-3">
            Desktop Experience Required
          </h1>

          <p className="text-sm text-[#86868B] leading-relaxed mb-6">
            The Reach World cards management console is engineered strictly for desktop monitors, Mac displays, and widescreen workflows (&gt;= 1024px).
          </p>

          <div className="w-full bg-[#F5F5F7] rounded-2xl p-4 text-xs text-[#86868B] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#1D1D1F]" />
              Please open on your computer
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
