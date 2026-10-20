"use client";

import React, { useState } from "react";
import {
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  CreditCard,
} from "lucide-react";
import { CardListItem, toggleCardStatus } from "@/actions/card-actions";

interface CardsTableProps {
  cards: CardListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectForPreview: (card: CardListItem) => void;
  selectedCardId?: string;
  onEditCard: (card: CardListItem) => void;
  onDeleteCard: (cardId: string) => void;
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
  onDeleteCard,
}: CardsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      {/* Table Header Top Bar */}
      <div className="px-6 py-4.5 border-b border-black/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
            Team Cards
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F5F7] text-[#86868B]">
            {total} Total
          </span>
        </div>
      </div>

      {/* Table Records */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.04] bg-[#FBFBFD] text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              <th className="py-3.5 px-6">Employee</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Public URL</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Taps</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] text-xs">
            {cards.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] mb-3">
                      <CreditCard className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1D1D1F]">
                      No Reach Cards Created Yet
                    </p>
                    <p className="text-xs text-[#86868B] mt-1">
                      Click "+ Create Card" to generate your first corporate NFC card.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cards.map((card) => {
                const isSelected = selectedCardId === card._id;
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
                    {/* Employee Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#0d274c] border border-[#1e3a63] flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-xs">
                          {card.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-[#1D1D1F] truncate flex items-center gap-1.5">
                            {card.name}
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                            )}
                          </div>
                          <div className="text-[#86868B] text-xs truncate font-medium">
                            {card.jobTitle || "REACH WORLD"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F5F7] text-[#1D1D1F]">
                        {card.department || "Corporate"}
                      </span>
                    </td>

                    {/* Slug / Public URL */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-1 rounded-lg font-medium">
                          /{card.slug}
                        </span>
                        <a
                          href={`/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#86868B] hover:text-[#0071E3] transition-colors p-1"
                          title="Open public card"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
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
                        title={card.isActive ? "Click to Pause" : "Click to Activate"}
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F]">
                        <Eye className="w-3.5 h-3.5 text-[#86868B]" />
                        {card.views.toLocaleString()}
                      </span>
                    </td>

                    {/* Actions: Edit, Copy, Delete */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleCopyLink(card.slug, card._id)}
                          className="w-8 h-8 rounded-xl hover:bg-black/5 text-[#86868B] hover:text-[#0071E3] flex items-center justify-center transition-colors"
                          title="Copy Link to Clipboard"
                        >
                          {copiedId === card._id ? (
                            <Check className="w-4 h-4 text-[#34C759]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onEditCard(card)}
                          className="w-8 h-8 rounded-xl hover:bg-black/5 text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors"
                          title="Edit Card"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete card for ${card.name}?`)) {
                              onDeleteCard(card._id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl hover:bg-red-50 text-[#86868B] hover:text-red-500 flex items-center justify-center transition-colors"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
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
            Page {currentPage} of {totalPages}
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
