"use client";

import React, { useState } from "react";
import {
  Pencil,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  RotateCcw,
  UserCheck,
  Globe,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { CardListItem, toggleCardStatus, resetCard } from "@/actions/card-actions";

interface CardsTableProps {
  cards: CardListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSelectForPreview: (card: CardListItem) => void;
  selectedCardId?: string;
  onEditCard: (card: CardListItem) => void;
  onOpenPreview: (card: CardListItem) => void;
  onOpenAnalytics?: (card: CardListItem) => void;
  onResetSuccess?: () => void;
}

export default function CardsTable({
  cards,
  total,
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
  onSelectForPreview,
  selectedCardId,
  onEditCard,
  onOpenPreview,
  onOpenAnalytics,
  onResetSuccess,
}: CardsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handleCopyLink = (slug: string, id: string) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/${slug}`
        : `https://reachworld.com/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (card: CardListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(card._id);
    try {
      await toggleCardStatus(card._id, !card.isActive);
      card.isActive = !card.isActive;
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetCard = async (card: CardListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Reset Slot #${card.cardNumber}? This clears custom fields and resets to default clean state.`
    );
    if (!confirmed) return;

    setResettingId(card._id);
    try {
      const res = await resetCard(card._id);
      if (res.success && onResetSuccess) {
        onResetSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden font-sans">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            PHYSICAL NFC CARDS
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {cards.length} of {total} slots
          </span>
        </div>

        <div className="text-xs text-slate-700 flex items-center gap-2 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-800 font-semibold">Active Registry</span>
        </div>
      </div>

      {/* Table Records */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-6 w-24">Slot</th>
              <th className="py-3.5 px-4">Card Assignment</th>
              <th className="py-3.5 px-4">Destination Link</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Taps & Clicks</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-5 w-10 bg-slate-200 rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-5 w-10 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-4 w-12 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-7 w-20 bg-slate-200 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <CreditCard className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      No cards match your query
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Clear search query or switch filter to view slots.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cards.map((card) => {
                const isSelected = selectedCardId === card._id;
                const paddedSlot =
                  card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;
                const isRedirect = card.mode === "redirect";
                const isDefaultName = card.name.startsWith("Card #");
                const totalIconClicks =
                  (card.links || []).reduce((acc, l) => acc + (l.clicks || 0), 0) +
                  (card.vcardClicks || 0);

                return (
                  <tr
                    key={card._id}
                    onClick={() => {
                      onSelectForPreview(card);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-slate-100/70"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Slot # Badge (Monochrome Navy/Black) */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="text-xs font-bold font-mono text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        #{paddedSlot}
                      </span>
                    </td>

                    {/* Card Assignment (Name & Department) */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#0F172A] truncate flex items-center gap-1.5">
                          {card.name}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0A192F]" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {isDefaultName ? (
                            <span className="text-slate-400 font-normal">Unassigned Slot</span>
                          ) : (
                            <span>
                              {card.jobTitle || "Executive"} {card.department ? `• ${card.department}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Card Link Mode & Target Destination */}
                    <td className="py-3.5 px-4 min-w-[240px]">
                      {isRedirect ? (
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-[#0F172A] border border-slate-200">
                            <Globe className="w-3 h-3 text-[#0A192F]" />
                            <span>Custom Link</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[220px] block font-mono" title={card.redirectUrl}>
                            {card.redirectUrl || "No destination URL"}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/70">
                            <UserCheck className="w-3 h-3 text-[#0A192F]" />
                            <span>Digital Profile</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            /{card.slug}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle Switch: Pleasant Emerald when active, refined Warm Rose when paused */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggle(card, e)}
                        disabled={togglingId === card._id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 shadow-2xs ${
                          card.isActive ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-500 hover:bg-rose-600"
                        }`}
                        title={card.isActive ? "Active (Click to Pause)" : "Paused (Click to Activate)"}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            card.isActive ? "translate-x-4.5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Tap / View Counter - Direct Click to Dedicated Analytics */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAnalytics) onOpenAnalytics(card);
                        }}
                        className="inline-flex flex-col items-center hover:scale-105 transition-transform cursor-pointer group"
                        title="Click to view detailed analytics & clicks for this card"
                      >
                        <span className="text-xs font-bold text-[#0F172A] font-mono group-hover:underline transition-all">
                          {card.views.toLocaleString()} taps
                        </span>
                        {!isRedirect && totalIconClicks > 0 ? (
                          <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80 mt-0.5 font-mono shadow-2xs">
                            {totalIconClicks} clicks
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono">0 clicks</span>
                        )}
                      </div>
                    </td>

                    {/* Actions: Dedicated Analytics, Preview Modal, Copy URL, External, Edit, Reset */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Dedicated In-Depth Analytics Button */}
                        <button
                          onClick={() => onOpenAnalytics ? onOpenAnalytics(card) : onSelectForPreview(card)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0A192F] flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80"
                          title="Open Analytics for this card"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-[#0A192F]" />
                        </button>

                        {/* Preview Mobile Popup Button */}
                        <button
                          onClick={() => onOpenPreview(card)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0A192F] flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80"
                          title="Open Mobile Screen Preview"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-[#0A192F]" />
                        </button>

                        {/* Copy URL */}
                        <button
                          onClick={() => handleCopyLink(card.slug, card._id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0A192F] flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80"
                          title={`Copy URL (reachworld.com/${card.slug})`}
                        >
                          {copiedId === card._id ? (
                            <Check className="w-3.5 h-3.5 text-slate-900" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#0A192F]" />
                          )}
                        </button>

                        {/* Open Test in New Tab */}
                        <a
                          href={`/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0A192F] flex items-center justify-center transition-colors border border-slate-200/80"
                          title="Open card link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#0A192F]" />
                        </a>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditCard(card)}
                          className="px-2.5 py-1 rounded-lg bg-[#0A192F] hover:bg-[#071324] text-white font-medium text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="Edit Card"
                        >
                          <Pencil className="w-3 h-3 text-slate-300" />
                          <span>Edit</span>
                        </button>

                        {/* Reset Card Slot */}
                        <button
                          onClick={(e) => handleResetCard(card, e)}
                          disabled={resettingId === card._id}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                          title="Reset Slot"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages} (50 Enterprise Slots)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-700 font-medium text-xs shadow-xs"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-700 font-medium text-xs shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
