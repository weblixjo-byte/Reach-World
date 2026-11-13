"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@reachworld.com");
  const [password, setPassword] = useState("Hussein");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await loginAction({ email, password });
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Authentication failed. Check credentials.");
      }
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[#020b18] text-white font-sans overflow-hidden">
      {/* Optimized Brand Feather Background */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-black/25 to-[#020b18]/80" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand Card Container - Executive Frosted Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.05] border border-white/[0.14] p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Glass Top Rim Reflection */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none" />

          {/* Brand Logo */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <img
                src="/reach-world-logo.png"
                alt="Reach World"
                className="h-10 w-auto object-contain brightness-0 invert drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
              />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              NFC Management Console
            </h1>
            <p className="text-xs text-slate-300/70 mt-1 font-medium">
              Authorized Console Access
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-900/80 text-rose-300 text-xs text-center backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username / Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reachworld.com"
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-400/60 focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-sky-500/20 transition-all backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-400/60 focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-sky-500/20 transition-all backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-[#0062E0] via-[#0077F2] to-[#0091FF] hover:brightness-110 active:scale-[0.99] border border-sky-300/30 text-white font-semibold rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center shadow-[0_4px_20px_rgba(0,119,242,0.4)]"
            >
              {isPending ? "Verifying Credentials..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>256-bit Encrypted Session</span>
            <span>Reach World</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400/70">
          powered by{" "}
          <a
            href="https://weblix-jo.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors underline underline-offset-2 font-medium"
          >
            weblix-jo
          </a>
        </div>
      </div>
    </div>
  );
}
