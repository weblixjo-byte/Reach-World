import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReachWorldLogo } from "@/components/icons/SocialIcons";

export const metadata = {
  title: "404 — Page Not Found | Reach World",
  description: "Page not found",
};

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-between bg-[#020b18] text-white p-6 font-sans">
      {/* Top Logo */}
      <div className="pt-6">
        <Link href="/" className="inline-block">
          <ReachWorldLogo className="w-36 drop-shadow-md" />
        </Link>
      </div>

      {/* Basic Center Content */}
      <div className="text-center max-w-sm w-full my-auto py-8">
        <span className="text-7xl font-extrabold text-white tracking-tight font-mono block mb-2">
          404
        </span>
        <h1 className="text-xl font-bold text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The page or card handle you are looking for does not exist.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0A192F] font-bold text-xs hover:bg-slate-100 transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Simple Footer */}
      <footer className="pb-4 text-center">
        <p className="text-[11px] text-slate-500">
          powered by{" "}
          <a
            href="https://weblix-jo.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white underline transition-colors"
          >
            weblix-jo
          </a>
        </p>
      </footer>
    </main>
  );
}
