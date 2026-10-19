"use client";

import React, { useState } from "react";
import { Building2, Save, Globe, Mail, Phone, MapPin, Check } from "lucide-react";

interface CompanyProfileViewProps {
  onBackToRegistry: () => void;
}

export default function CompanyProfileView({ onBackToRegistry }: CompanyProfileViewProps) {
  const [companyName, setCompanyName] = useState("Reach World");
  const [website, setWebsite] = useState("https://reachworld.com");
  const [email, setEmail] = useState("contact@reachworld.com");
  const [phone, setPhone] = useState("+962 6 000 0000");
  const [address, setAddress] = useState("Amman, Jordan");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F172A]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Company Profile & Corporate Identity
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-medium">
            Configure Reach World corporate information and branding displayed across all employee cards.
          </p>
        </div>
        <button
          onClick={onBackToRegistry}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors"
        >
          Back to Cards
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Settings (Left) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                Official Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                Phone Hotline
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                Headquarters
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Changes Saved" : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Brand Preview (Right) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a192f] text-white space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Brand Appearance Preview
          </span>

          <div className="flex flex-col items-center justify-center p-6 bg-[#0f2444] rounded-2xl border border-white/10 text-center">
            <img
              src="/reach-world-logo.png"
              alt="Reach World"
              className="w-32 h-auto object-contain brightness-0 invert opacity-95 mb-4"
            />
            <h4 className="text-base font-bold text-white">{companyName}</h4>
            <p className="text-xs text-[#94A3B8] mt-1">{website}</p>
          </div>

          <div className="text-xs text-[#94A3B8] leading-relaxed border-t border-white/10 pt-4 space-y-1">
            <p className="font-semibold text-white">Default Badge & Card Footer:</p>
            <p>Every employee digital bio is watermarked with this official branding badge.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
