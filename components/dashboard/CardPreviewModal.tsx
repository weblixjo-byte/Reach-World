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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 max-h-[95vh] overflow-y-auto no-scrollbar flex flex-col items-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
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
