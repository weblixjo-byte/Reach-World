"use client";

import React, { useState, useEffect } from "react";
import { X, Lock, ShieldCheck } from "lucide-react";
import {
  getAdminProfileAction,
  updateAdminCredentialsAction,
} from "@/actions/auth-actions";

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSecurityModal({
  isOpen,
  onClose,
}: AdminSecurityModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      getAdminProfileAction().then((profile) => {
        if (profile) {
          setEmail(profile.email);
          setName(profile.name || "Reach World Admin");
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword && newPassword.length < 5) {
      setError("New password must be at least 5 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateAdminCredentialsAction({
        newEmail: email,
        currentPassword,
        newPassword: newPassword.trim() || undefined,
        newName: name.trim() || undefined,
      });

      if (res.success) {
        setSuccess("Credentials updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.error || "Failed to update credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020b18]/80 backdrop-blur-md animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md bg-[#020b18] border border-white/15 rounded-3xl shadow-2xl text-white overflow-hidden backdrop-blur-2xl">
        {/* Approved Royal Dark Blue Feather Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-35">
          <picture>
            <source srcSet="/card-bg.webp" type="image/webp" />
            <img
              src="/card-bg.jpg"
              alt=""
              className="w-full h-full object-cover object-center scale-110"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/80 via-[#020b18]/90 to-[#020b18]/98" />
        </div>

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Settings & Credentials
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Master Security
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="relative z-10 p-7 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium">
              {success}
            </div>
          )}

          {/* Admin Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Login Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
            />
          </div>

          <div className="h-px bg-white/10 my-2" />

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
            />
          </div>

          {/* New Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#020b18] bg-white hover:bg-slate-100 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
