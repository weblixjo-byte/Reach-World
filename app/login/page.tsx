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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07101e] text-white font-sans">
      <div className="w-full max-w-sm">
        {/* Brand Card Container - Formal Executive Style */}
        <div className="bg-[#0c182b] border border-slate-800 rounded-2xl p-8 shadow-xl">
          {/* Old Original Brand Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/reach-world-logo.png"
                alt="Reach World"
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              NFC Management Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Corporate Access
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          {/* Login Form - Zero Icons, Formal Style */}
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
                className="w-full px-3.5 py-2.5 bg-[#07101e] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
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
                className="w-full px-3.5 py-2.5 bg-[#07101e] border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-white font-medium rounded-lg text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
            >
              {isPending ? "Verifying Credentials..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>256-bit Encrypted Session</span>
            <span>Reach World Corp</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          powered by{" "}
          <a
            href="https://weblix-jo.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
          >
            weblix-jo
          </a>
        </div>
      </div>
    </div>
  );
}
