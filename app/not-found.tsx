import React from "react";
import { Globe, ArrowRight } from "lucide-react";
import { ReachWorldLogo } from "@/components/icons/SocialIcons";

export const metadata = {
  title: "404 — Page Not Found | Reach World",
  description: "The requested Reach World page or digital card could not be found.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#020b18] text-white selection:bg-[#0071E3]/30 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] font-sans overflow-hidden">
      {/* Approved Royal Dark Blue Feather Ambient Background */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/65 via-black/30 to-[#020b18]/85" />
      </div>

      {/* Top Reach World Official Logo */}
      <div className="relative z-10 pt-4 pb-2">
        <a href="https://reachworld.com" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90 transition-opacity">
          <ReachWorldLogo className="w-36 sm:w-40 opacity-90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" />
        </a>
      </div>

      {/* Basic Clean 404 Center Message */}
      <div className="relative z-10 text-center max-w-sm w-full my-auto px-6 py-8">
        <span className="text-7xl sm:text-8xl font-black text-white tracking-tight font-mono block mb-3 drop-shadow-lg">
          404
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-300/80 mb-8 leading-relaxed max-w-xs mx-auto">
          The page or digital card handle you are looking for does not exist.
        </p>

        <a
          href="https://reachworld.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0A192F] hover:bg-slate-100 font-bold text-xs transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#0A192F]" />
          <span>reachworld.com</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>

      {/* Official Clean Footer */}
      <footer className="relative z-10 w-full max-w-[420px] pt-6 pb-2 flex flex-col items-center">
        <div className="w-full h-px bg-white/10 mb-4" />
        <p className="text-center text-[10px] text-white/40 font-medium tracking-wide">
          powered by{" "}
          <a
            href="https://weblix-jo.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white underline decoration-white/30 transition-colors font-semibold"
          >
            weblix-jo
          </a>
        </p>
      </footer>
    </main>
  );
}
