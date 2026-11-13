"use client";

import React from "react";
import { X } from "lucide-react";
import LivePhonePreview, { PhoneCardData } from "@/components/dashboard/LivePhonePreview";

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: PhoneCardData | null;
}

export default function CardPreviewModal({
  isOpen,
  onClose,
  card,
}: CardPreviewModalProps) {
  if (!isOpen || !card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-[#020b18]/90 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] border border-white/15 max-h-[95vh] overflow-y-auto no-scrollbar flex flex-col items-center animate-in zoom-in-95 duration-150 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass Top Rim Line */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 shadow-sm"
          title="Close Preview"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Live Phone Preview inside modal */}
        <LivePhonePreview card={card} />
      </div>
    </div>
  );
}
