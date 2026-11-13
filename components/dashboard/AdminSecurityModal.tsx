"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminProfileAction,
  updateAdminCredentialsAction,
} from "@/actions/auth-actions";
import { resetAllAnalyticsAction } from "@/actions/card-actions";

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyticsReset?: () => void;
}

export default function AdminSecurityModal({
  isOpen,
  onClose,
  onAnalyticsReset,
}: AdminSecurityModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResettingAnalytics, setIsResettingAnalytics] = useState(false);
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
      setError("Please enter your current password to authorize changes.");
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

  const handleZeroOutAnalytics = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to zero-out all analytics, taps, and link clicks across all 50 cards? This will reset all counts to 0 for client handover."
    );
    if (!confirmed) return;

    setIsResettingAnalytics(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await resetAllAnalyticsAction();
      if (res.success) {
        setSuccess("All 50 cards analytics, taps, and link clicks have been reset to 0.");
        if (onAnalyticsReset) onAnalyticsReset();
      } else {
        setError(res.error || "Failed to reset analytics.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset analytics.");
    } finally {
      setIsResettingAnalytics(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md bg-[#0c182b] border border-slate-800 rounded-xl shadow-xl text-white overflow-hidden">
        {/* Modal Header - Formal, Zero Icons */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#091322]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Security & Credentials
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Update login credentials and master password
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg leading-none p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Form - Formal Corporate Style */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs">
              {success}
            </div>
          )}

          {/* Admin Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reach World Admin"
              className="w-full px-3 py-2 bg-[#07101e] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Login Email / Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Login Username / Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@reachworld.com"
              className="w-full px-3 py-2 bg-[#07101e] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <span className="block text-xs font-medium text-slate-300">
              Update Password (Optional)
            </span>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                New Password (leave empty to keep current)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 5 chars)"
                className="w-full px-3 py-2 bg-[#07101e] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>

            {newPassword && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-[#07101e] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            )}
          </div>

          {/* Current Password Verification */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-medium text-slate-200 mb-1">
              Current Password (Required to save changes)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password (default: Hussein)"
              className="w-full px-3 py-2 bg-[#07101e] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Client Handover / Zero-Out Analytics Section */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-rose-300">
                  Reset Analytics for Client Handover
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Zeros out all scan counts, link clicks, and vCard saves across all 50 cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleZeroOutAnalytics}
                disabled={isResettingAnalytics}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-[11px] font-medium text-rose-200 transition-colors cursor-pointer shrink-0 ml-3 disabled:opacity-50"
              >
                {isResettingAnalytics ? "Resetting..." : "Zero-Out All Data"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600/60 disabled:opacity-50 text-xs font-medium text-white transition-all cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
