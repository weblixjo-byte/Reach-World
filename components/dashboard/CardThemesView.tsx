"use client";

import React, { useState } from "react";
import { Palette, Check, Sparkles, Smartphone } from "lucide-react";

interface CardThemesViewProps {
  onBackToRegistry: () => void;
}

export default function CardThemesView({ onBackToRegistry }: CardThemesViewProps) {
  const [selectedTheme, setSelectedTheme] = useState("apple-slate");

  const themes = [
    {
      id: "apple-slate",
      name: "Apple Slate & Navy",
      badge: "Standard",
      description: "Executive minimalism with deep dark blue accents and subtle border highlights.",
      bgClass: "from-[#0F172A] to-[#1E293B]",
      accentColor: "#0F172A",
      textClass: "text-[#0F172A]",
    },
    {
      id: "royal-blue",
      name: "Reach World Sapphire",
      badge: "Corporate",
      description: "Official Reach World brand blue (#0071E3) with clean typography.",
      bgClass: "from-[#0071E3] to-[#1D4ED8]",
      accentColor: "#0071E3",
      textClass: "text-[#0071E3]",
    },
    {
      id: "obsidian-black",
      name: "Titanium Obsidian",
      badge: "Dark Mode",
      description: "True OLED black with brushed titanium edges and high contrast.",
      bgClass: "from-[#000000] to-[#171717]",
      accentColor: "#000000",
      textClass: "text-[#171717]",
    },
    {
      id: "emerald-lux",
      name: "Nordic Emerald",
      badge: "Eco & Tech",
      description: "Subtle forest emerald accents tailored for sustainable energy or tech teams.",
      bgClass: "from-[#065F46] to-[#047857]",
      accentColor: "#065F46",
      textClass: "text-[#065F46]",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#0F172A]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Card Themes & Aesthetic Presets
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-medium">
            Choose the default visual appearance applied when visitors open your team members' NFC links.
          </p>
        </div>
        <button
          onClick={onBackToRegistry}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors"
        >
          Back to Cards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-5 ${
                isSelected
                  ? "border-[#0071E3] bg-[#F0F7FF] shadow-md ring-2 ring-[#0071E3]/20"
                  : "border-black/[0.06] bg-[#FBFBFD] hover:border-black/20"
              }`}
            >
              <div className="space-y-3">
                {/* Visual Color Preview Box */}
                <div
                  className={`h-24 rounded-xl bg-gradient-to-br ${theme.bgClass} flex items-center justify-center p-3 text-white shadow-inner relative`}
                >
                  <Smartphone className="w-6 h-6 opacity-80" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-white text-[#0071E3] p-1 rounded-full shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1D1D1F]">{theme.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-[#64748B]">
                    {theme.badge}
                  </span>
                </div>

                <p className="text-[11px] text-[#86868B] leading-relaxed">
                  {theme.description}
                </p>
              </div>

              <button
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#0071E3] text-white"
                    : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-black/5"
                }`}
              >
                {isSelected ? "Active Preset" : "Apply to Cards"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
