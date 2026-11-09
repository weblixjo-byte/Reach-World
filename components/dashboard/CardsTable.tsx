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
  MousePointerClick,
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            PHYSICAL NFC CARDS
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Showing {cards.length} of {total} slots
          </span>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active Registry</span>
        </div>
      </div>

      {/* Table Records */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th className="py-3 px-6 w-20">Slot</th>
              <th className="py-3 px-4">Card Assignment</th>
              <th className="py-3 px-4">Destination Link</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Taps</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {cards.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <CreditCard className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      No cards match your query
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
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
                    onClick={() => onSelectForPreview(card)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/50"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Slot # Badge (Clean, Monospaced) */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/70">
                        #{paddedSlot}
                      </span>
                    </td>

                    {/* Card Assignment (Name & Department) */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate flex items-center gap-1.5">
                          {card.name}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {isDefaultName ? (
                            <span className="text-slate-400 font-normal">Unassigned Slot • Click to edit</span>
                          ) : (
                            <span>
                              {card.jobTitle || "Executive"} {card.department ? `• ${card.department}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Card Link Mode & Target Destination */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      {isRedirect ? (
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>Custom Link</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] block" title={card.redirectUrl}>
                            {card.redirectUrl || "No destination URL"}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span>Digital Profile</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            reachworld.com/{card.slug}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggle(card, e)}
                        disabled={togglingId === card._id}
                        className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                          card.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        title={card.isActive ? "Active (Click to Pause)" : "Paused (Click to Activate)"}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                            card.isActive ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Tap / View Counter */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {card.views.toLocaleString()} taps
                        </span>
                        {!isRedirect && totalIconClicks > 0 && (
                          <span className="text-[10px] font-mono text-blue-600 font-medium">
                            {totalIconClicks} clicks
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions: Edit, Live Test, Copy URL */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Copy URL */}
                        <button
                          onClick={() => handleCopyLink(card.slug, card._id)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                          title={`Copy URL (reachworld.com/${card.slug})`}
                        >
                          {copiedId === card._id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open Test in New Tab */}
                        <a
                          href={`/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                          title="Open card link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditCard(card)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300 font-semibold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          title="Edit Card"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        {/* Reset Card Slot */}
                        <button
                          onClick={(e) => handleResetCard(card, e)}
                          disabled={resettingId === card._id}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
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
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages} (50 Enterprise Slots)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-700 font-medium text-xs"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-700 font-medium text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
