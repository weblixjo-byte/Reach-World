import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Globe } from "lucide-react";
import { ReachWorldLogo } from "@/components/icons/SocialIcons";

export const metadata = {
  title: "404 — Page Not Located | Reach World",
  description: "The requested Reach World NFC digital card or page could not be found.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#020b18] text-white selection:bg-[#0071E3]/30 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] font-sans overflow-hidden">
      {/* Background Feather Image with Dark Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020b18]">
        <picture>
          <source srcSet="/card-bg.webp" type="image/webp" />
          <img
            src="/card-bg.jpg"
            alt="Reach World Background"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-black/35 to-[#020b18]/90" />
      </div>

      {/* Top Logo */}
      <div className="relative z-10 pt-4 pb-2">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <ReachWorldLogo className="w-36 sm:w-44 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" />
        </Link>
      </div>

      {/* Center 404 Glassmorphic Container with Motion Graphic */}
      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center my-auto px-7 py-9 rounded-3xl bg-white/[0.05] border border-white/[0.13] shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none" />

        {/* Lightweight SVG Motion Graphic: Floating Orbital Radar */}
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          {/* Subtle Outer Pulsing Wave */}
          <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-pulse-radar pointer-events-none" />

          {/* Outer Rotating Dashed Orbit */}
          <div className="absolute inset-2 rounded-full border border-dashed border-white/20 animate-orbit-slow pointer-events-none">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          </div>

          {/* Inner Counter-Rotating Orbit */}
          <div className="absolute inset-6 rounded-full border border-white/10 animate-orbit-reverse pointer-events-none">
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          </div>

          {/* Floating Core Icon Pill */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/25 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(0,0,0,0.4)] backdrop-blur-md animate-float-gentle">
            <Compass className="w-8 h-8 text-sky-300 stroke-[1.5]" />
          </div>
        </div>

        {/* 404 Tag & Heading */}
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/15 border border-sky-400/25 text-sky-300 mb-3 tracking-wider">
          ERROR 404 • SIGNAL LOST
        </span>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          Page Not Located
        </h1>

        <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-xs mx-auto mb-7">
          The requested link or card handle does not exist in the Reach World fleet registry.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0062E0] via-[#0077F2] to-[#0091FF] hover:opacity-95 shadow-[0_0_20px_rgba(0,119,242,0.4)] border border-sky-300/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Registry</span>
          </Link>

          <a
            href="https://reachworld.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>reachworld.com</span>
          </a>
        </div>
      </div>

      {/* Official Footer */}
      <footer className="relative z-10 w-full max-w-[420px] pt-6 pb-2 flex flex-col items-center">
        <div className="w-full h-px bg-white/10 mb-4" />
        <p className="text-center text-[10px] text-white/40 font-medium tracking-wide">
          powered by{" "}
          <a
            href="https://weblix-jo.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-sky-300 underline decoration-white/30 transition-colors font-semibold"
          >
            weblix-jo
          </a>
        </p>
      </footer>
    </main>
  );
}
