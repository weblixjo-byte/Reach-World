"use client";

import React, { useState } from "react";
import {
  Pencil,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  CreditCard,
  RotateCcw,
  Link as LinkIcon,
  UserCheck,
  Globe,
  Sparkles,
} from "lucide-react";
import { CardListItem, toggleCardStatus, resetCard } from "@/actions/card-actions";

interface CardsTableProps {
  cards: CardListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectForPreview: (card: CardListItem) => void;
  selectedCardId?: string;
  onEditCard: (card: CardListItem) => void;
  onResetSuccess?: () => void;
}

export default function CardsTable({
  cards,
  total,
  currentPage,
  totalPages,
  onPageChange,
  onSelectForPreview,
  selectedCardId,
  onEditCard,
  onResetSuccess,
}: CardsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handleCopyLink = (slug: string, id: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://reachworld.com";
    navigator.clipboard.writeText(`${origin}/${slug}`);
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
    const padded = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;
    const confirmed = window.confirm(
      `Reset Card #${padded} (${card.name}) back to default template?\n\nThe fixed physical link (/${card.slug}) will be kept intact.`
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
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-6 py-4.5 border-b border-black/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
              50 Fixed Physical NFC Cards
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0a192f] text-white">
              Slots 1 - 50
            </span>
          </div>
          <span className="text-xs text-[#86868B] font-medium hidden sm:inline">
            Showing {cards.length} of {total} slots
          </span>
        </div>

        <div className="text-xs text-[#86868B] flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <span>Permanent Hardware Paths</span>
        </div>
      </div>

      {/* Table Records */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.04] bg-[#FBFBFD] text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              <th className="py-3.5 px-6 w-20">Slot #</th>
              <th className="py-3.5 px-4">Card Assignment / Employee</th>
              <th className="py-3.5 px-4">Destination Routing</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Taps</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] text-xs">
            {cards.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] mb-3">
                      <CreditCard className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1D1D1F]">
                      No Cards Match Your Filter
                    </p>
                    <p className="text-xs text-[#86868B] mt-1">
                      Try clearing search queries or switching filters.
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

                return (
                  <tr
                    key={card._id}
                    onClick={() => onSelectForPreview(card)}
                    className={`cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-[#0071E3]/[0.06]"
                        : "hover:bg-[#F5F5F7]/80"
                    }`}
                  >
                    {/* Slot # Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0a192f] text-white font-mono font-bold text-xs shadow-xs">
                        <span className="text-[10px] text-amber-400">#</span>
                        <span>{paddedSlot}</span>
                      </div>
                    </td>

                    {/* Card Assignment (Name & Department) */}
                    <td className="py-4 px-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0a192f]/5 border border-black/5 flex items-center justify-center font-bold text-[#0a192f] text-xs shrink-0">
                          {card.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-[#1D1D1F] truncate flex items-center gap-1.5">
                            {card.name}
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                            )}
                          </div>
                          <div className="text-[#86868B] text-[11px] truncate font-medium flex items-center gap-1.5">
                            <span>{card.jobTitle || "Executive"}</span>
                            <span>•</span>
                            <span>{card.department || "Reach World"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Destination Routing Mode & Target */}
                    <td className="py-4 px-4 min-w-[240px]">
                      {isRedirect ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0071E3]/10 text-[#0071E3]">
                            <LinkIcon className="w-3 h-3" />
                            <span>Direct Redirect</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F] font-mono truncate max-w-[220px]" title={card.redirectUrl}>
                            <Globe className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                            <span className="truncate">{card.redirectUrl || "No URL Set"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700">
                            <UserCheck className="w-3 h-3" />
                            <span>Digital Bio Profile</span>
                          </div>
                          <div className="text-[11px] text-[#86868B] font-mono">
                            Path: /{card.slug} ({card.linksCount} links)
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggle(card, e)}
                        disabled={togglingId === card._id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                          card.isActive ? "bg-[#34C759]" : "bg-black/20"
                        }`}
                        title={card.isActive ? "Active (Click to Pause)" : "Paused (Click to Activate)"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                            card.isActive ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Tap / View Counter */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1D1D1F]">
                          <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                          {card.views.toLocaleString()}
                        </span>
                        {card.lastTappedAt && (
                          <span className="text-[10px] text-[#86868B]">
                            {new Date(card.lastTappedAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions: Edit Destination, Test NFC, Copy URL, Reset */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Copy NFC URL */}
                        <button
                          onClick={() => handleCopyLink(card.slug, card._id)}
                          className="w-8 h-8 rounded-xl hover:bg-black/5 text-[#86868B] hover:text-[#0071E3] flex items-center justify-center transition-colors"
                          title={`Copy NFC URL (/${card.slug})`}
                        >
                          {copiedId === card._id ? (
                            <Check className="w-4 h-4 text-[#34C759]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Test NFC Link Live */}
                        <a
                          href={`/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl hover:bg-black/5 text-[#86868B] hover:text-[#0071E3] flex items-center justify-center transition-colors"
                          title="Test NFC Link in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit Card Profile & Destination */}
                        <button
                          onClick={() => onEditCard(card)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 font-bold text-xs transition-colors shadow-xs"
                          title="Configure Destination & Profile"
                        >
                          <Pencil className="w-3 h-3 stroke-[2.5]" />
                          <span>Edit</span>
                        </button>

                        {/* Reset Card Slot */}
                        <button
                          onClick={(e) => handleResetCard(card, e)}
                          disabled={resettingId === card._id}
                          className="w-8 h-8 rounded-xl hover:bg-red-50 text-[#86868B] hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40"
                          title="Reset Slot to Default (Keeps Link #)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
        <div className="px-6 py-4 border-t border-black/[0.04] bg-[#FBFBFD] flex items-center justify-between text-xs text-[#86868B]">
          <span>
            Page {currentPage} of {totalPages} (50 Fixed Physical NFC Slots)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-xl border border-black/10 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-semibold text-[#1D1D1F]"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-black/10 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-semibold text-[#1D1D1F]"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
