"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Copy, Check } from "lucide-react";

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export default function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // During SSR or first render tick, render neutral container to prevent hydration flash
  if (isDesktop === null) {
    return <div className="min-h-screen bg-[#F8F9FA]" />;
  }

  if (!isDesktop) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-[#1D1D1F]">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-black/[0.06] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          {/* Reach World Brand Logo */}
          <div className="mb-6">
            <img
              src="/reach-world-logo.png"
              alt="Reach World"
              className="h-8 w-auto object-contain mx-auto"
            />
          </div>

          {/* Clean Monitor Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#0a192f]/5 flex items-center justify-center text-[#0a192f] mb-5">
            <Monitor className="w-7 h-7 stroke-[1.75]" />
          </div>

          {/* Simple, Non-pretentious Title */}
          <h1 className="text-lg font-bold tracking-tight text-[#0F172A] mb-2">
            Desktop View Required
          </h1>

          {/* Simple, Direct English Notice */}
          <p className="text-xs text-[#64748B] leading-relaxed mb-6 font-medium">
            Please open this page on a desktop computer or laptop to access the dashboard.
          </p>

          {/* Quick Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl bg-[#0a192f] hover:bg-[#13284c] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#34C759]" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Dashboard Link</span>
              </>
            )}
          </button>
        </div>

        {/* Subtle Brand Tagline at Bottom */}
        <p className="text-[11px] text-[#94A3B8] font-medium mt-6">
          Reach World • Digital Management Console
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
