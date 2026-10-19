"use client";

import React, { useState, useEffect } from "react";
import { Download, Copy, Check, QrCode, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { CardListItem } from "@/actions/card-actions";

interface QRStudioViewProps {
  cards: CardListItem[];
  onBackToRegistry: () => void;
}

export default function QRStudioView({ cards, onBackToRegistry }: QRStudioViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(
    cards.length > 0 ? cards[0]._id : ""
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const currentCard = cards.find((c) => c._id === selectedCardId) || cards[0];

  const getCardUrl = (slug?: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug || "demo"}`;
    }
    return `https://reachworld.com/${slug || "demo"}`;
  };

  const targetUrl = currentCard ? getCardUrl(currentCard.slug) : "";

  useEffect(() => {
    if (targetUrl) {
      QRCode.toDataURL(targetUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [targetUrl]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${currentCard?.slug || "reach-world"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0F172A]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              QR Code Studio
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-medium">
            Generate and export high-resolution QR codes ready for physical NFC card engraving or print material.
          </p>
        </div>
        <button
          onClick={onBackToRegistry}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors"
        >
          Back to Cards
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#86868B]">
          No employee cards found. Create your first card in the registry to generate QR codes.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card Selector & Details (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2">
                Select Employee Card
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              >
                {cards.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.jobTitle} ({c.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Target URL Box */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Direct NFC Link
              </span>
              <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-black/[0.06]">
                <span className="text-xs font-mono text-[#0F172A] truncate">
                  {targetUrl}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-black/5 rounded-lg text-[#64748B] transition-colors"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-black/5 rounded-lg text-[#64748B] transition-colors"
                    title="Open Live Card"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Printing Specs Info */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Factory Print & Laser Engraving Specifications
              </h4>
              <ul className="text-xs text-[#64748B] space-y-2 list-disc list-inside leading-relaxed">
                <li>High density 600×600 DPI vector-compatible output.</li>
                <li>Optimized error correction level (Level M) for rapid scanning under glass and acrylic.</li>
                <li>Directly links to employee bio without intermediate redirects.</li>
              </ul>
            </div>
          </div>

          {/* QR Code Preview & Download (Right) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0] text-center">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/[0.06] mb-5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${currentCard?.name}`}
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-[#86868B]">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                {currentCard?.name}
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                {currentCard?.jobTitle} • {currentCard?.department}
              </p>
            </div>

            <button
              onClick={handleDownloadPNG}
              disabled={!qrDataUrl}
              className="w-full max-w-xs py-3 px-5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download High-Res PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
