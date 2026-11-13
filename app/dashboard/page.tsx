"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  Search,
  Download,
  Users,
  CreditCard,
  LayoutGrid,
  List,
  Pencil,
  RotateCcw,
  Globe,
  UserCheck,
  BarChart3,
} from "lucide-react";
import KPICards from "@/components/dashboard/KPICards";
import CardsTable from "@/components/dashboard/CardsTable";
import CardPreviewModal from "@/components/dashboard/CardPreviewModal";
import CardEditorModal from "@/components/dashboard/CardEditorModal";
import FleetAnalyticsView from "@/components/dashboard/FleetAnalyticsView";
import { useDashboardNav } from "@/app/dashboard/layout";
import {
  getDashboardData,
  updateCard,
  exportCardsToCSV,
  CardListItem,
  AnalyticsSummary,
  CardFormData,
} from "@/actions/card-actions";

export default function DashboardPage() {
  const { currentView, setCurrentView, analyticsCardId, setAnalyticsCardId, openAnalytics } = useDashboardNav();
  const [allCards, setAllCards] = useState<CardListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all"); // 'all' | 'profile' | 'redirect'
  const [viewMode, setViewMode] = useState<"table" | "rack">("table"); // Table vs Visual NFC Rack

  // Analytics Summary
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalCards: 50,
    totalActive: 50,
    totalTaps: 0,
    totalCustomLinks: 0,
    totalProfiles: 50,
    topPerformer: null,
    tapThroughRate: 0,
    recentTaps: [],
  });

  // Selected Card for Live Preview Modal
  const [previewCard, setPreviewCard] = useState<CardListItem | null>(null);

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardListItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load cards and analytics in 1 lightning-fast query
  const loadData = async () => {
    try {
      const res = await getDashboardData();
      setAllCards(res.cards);
      setDepartments(res.departments);
      setAnalytics(res.analytics);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // INSTANT in-memory filtering (0 milliseconds response time on every click)
  const filteredCards = useMemo(() => {
    let result = allCards;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const cleanNum = q.replace(/^[#\s]+/, "");
      result = result.filter((c) => {
        if (cleanNum && String(c.cardNumber) === cleanNum) return true;
        if (cleanNum && c.slug.toLowerCase() === cleanNum) return true;
        if (c.name.toLowerCase().includes(q)) return true;
        if (c.jobTitle?.toLowerCase().includes(q)) return true;
        if (c.department?.toLowerCase().includes(q)) return true;
        if (c.redirectUrl?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    if (selectedDept !== "all") {
      result = result.filter((c) => c.department === selectedDept);
    }

    if (statusFilter === "active") {
      result = result.filter((c) => c.isActive);
    } else if (statusFilter === "paused") {
      result = result.filter((c) => !c.isActive);
    }

    if (modeFilter === "profile") {
      result = result.filter((c) => c.mode !== "redirect");
    } else if (modeFilter === "redirect") {
      result = result.filter((c) => c.mode === "redirect");
    }

    return result;
  }, [allCards, searchQuery, selectedDept, statusFilter, modeFilter]);

  const handleEdit = (card: CardListItem) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSaveCard = async (data: CardFormData, id?: string) => {
    if (!id) return false;
    const res = await updateCard(id, data);
    if (res.success) {
      await loadData();
      return true;
    }
    return false;
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportCardsToCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Reach_World_50_NFC_Cards_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Top Metric Cards */}
      <KPICards analytics={analytics} />

      {/* View switching based on sidebar */}
      {currentView === "analytics" ? (
        /* DEDICATED FULL-SCREEN FLEET ANALYTICS & ENGAGEMENT INTELLIGENCE */
        <FleetAnalyticsView
          cards={allCards}
          analytics={analytics}
          selectedCardId={analyticsCardId}
          onSelectCard={(id) => setAnalyticsCardId(id)}
          onBackToRegistry={() => setCurrentView("cards")}
          onEditCard={(card) => handleEdit(card)}
        />
      ) : currentView === "departments" ? (
        /* DEPARTMENTS OVERVIEW - Frosted Glass Luxury */
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] p-8 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-2xl space-y-6">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Departments Overview (50 Cards)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect and filter employee cards by company division.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDept("all");
                setCurrentView("cards");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors cursor-pointer border border-white/10"
            >
              Reset to All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const countInDept = allCards.filter((c) => c.department === dept).length;
              return (
                <div
                  key={dept}
                  onClick={() => {
                    setSelectedDept(dept);
                    setCurrentView("cards");
                  }}
                  className="p-5 rounded-2xl border border-white/[0.08] hover:border-sky-400/40 bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer shadow-sm flex items-center justify-between group backdrop-blur-md"
                >
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                      {dept || "General"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {countInDept} Active Cards
                    </p>
                  </div>
                  <Users className="w-4 h-4 text-slate-400 group-hover:text-sky-300 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MAIN REGISTRY VIEW (FULL WIDTH) */
        <div className="space-y-4">
          {/* Corporate Header & Toolbar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  50 Physical NFC Cards Registry
                </h2>
                <p className="text-xs text-slate-400">
                  Fixed hardware slots (01 – 50) with permanent URLs (reachworld.com/1 to 50)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Switcher (Table vs Rack) */}
                <div className="bg-white/[0.06] p-0.5 rounded-xl flex items-center border border-white/10 backdrop-blur-md">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white/[0.12] text-white shadow-xs border border-white/15"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode("rack")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === "rack"
                        ? "bg-white/[0.12] text-white shadow-xs border border-white/15"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Rack</span>
                  </button>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting || allCards.length === 0}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] border border-white/10 text-slate-200 hover:bg-white/[0.12] hover:text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40 backdrop-blur-md"
                  title="Export 50 cards to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                </button>
              </div>
            </div>

            {/* Clean Single-Row Search & Filter Bar - Frosted Glass */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] p-3 border border-white/[0.10] shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl flex flex-wrap lg:flex-nowrap items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 50 cards by slot, employee, or link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/[0.08] focus:border-sky-400 focus:bg-white/[0.08] focus:outline-none transition-all bg-white/[0.03] text-white placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Mode Filter Pills */}
              <div className="flex items-center gap-1 shrink-0 bg-white/[0.05] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setModeFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "all"
                      ? "bg-white/[0.14] text-white shadow-xs border border-white/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setModeFilter("profile")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "profile"
                      ? "bg-white/[0.14] text-white shadow-xs border border-white/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bio Profiles
                </button>
                <button
                  onClick={() => setModeFilter("redirect")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "redirect"
                      ? "bg-white/[0.14] text-white shadow-xs border border-white/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Custom Links
                </button>
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-white/[0.10] bg-white/[0.05] text-slate-200 font-medium focus:outline-none focus:border-sky-400 shrink-0 cursor-pointer backdrop-blur-md"
              >
                <option value="all" className="bg-[#041226] text-white">All Status</option>
                <option value="active" className="bg-[#041226] text-white">Active Only</option>
                <option value="paused" className="bg-[#041226] text-white">Paused Only</option>
              </select>

              {/* Department Dropdown (if present) */}
              {departments.length > 0 && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-white/[0.10] bg-white/[0.05] text-slate-200 font-medium focus:outline-none focus:border-sky-400 shrink-0 cursor-pointer backdrop-blur-md"
                >
                  <option value="all" className="bg-[#041226] text-white">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#041226] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Full Width Table or Hardware Rack */}
          <div className="w-full">
            {viewMode === "table" ? (
              /* Full-Width Table View */
              <CardsTable
                cards={filteredCards}
                total={allCards.length || 50}
                currentPage={1}
                totalPages={1}
                isLoading={isLoading}
                onPageChange={() => {}}
                onSelectForPreview={(card) => setPreviewCard(card)}
                selectedCardId={previewCard?._id}
                onEditCard={handleEdit}
                onOpenPreview={(card) => setPreviewCard(card)}
                onOpenAnalytics={(card) => openAnalytics(card._id)}
                onResetSuccess={() => loadData()}
              />
            ) : (
              /* Visual 50-Card Hardware Rack View (Full Width) - Frosted Glass */
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] p-6 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-2xl space-y-4">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      50 Physical NFC Cards Rack
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click any card slot to inspect or test its destination.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-sky-300 bg-sky-500/15 px-3 py-1.5 rounded-xl border border-sky-400/25 font-mono">
                    Slots 01 – 50
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredCards.map((card) => {
                    const isSelected = previewCard?._id === card._id;
                    const isRedirect = card.mode === "redirect";
                    const padded = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;

                    return (
                      <div
                        key={card._id}
                        onClick={() => setPreviewCard(card)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 backdrop-blur-md ${
                          isSelected
                            ? "bg-white/[0.12] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-2 ring-sky-400/30"
                            : "bg-white/[0.03] border-white/[0.08] hover:border-sky-400/50 hover:bg-white/[0.06] hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-bold font-mono text-sky-300 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/10">
                            #{padded}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              card.isActive ? "bg-emerald-400" : "bg-slate-600"
                            }`}
                            title={card.isActive ? "Active" : "Paused"}
                          />
                        </div>

                        <div className="my-1 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate" title={card.name}>
                            {card.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {isRedirect ? "Custom Link" : card.jobTitle || "Digital Profile"}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-400 font-mono">
                            {card.views} taps
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(card);
                            }}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Edit Slot"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Live Mobile Preview Modal Popup */}
      <CardPreviewModal
        isOpen={!!previewCard}
        onClose={() => setPreviewCard(null)}
        card={
          previewCard
            ? {
                cardNumber: previewCard.cardNumber,
                name: previewCard.name,
                jobTitle: previewCard.jobTitle,
                department: previewCard.department,
                headline: previewCard.headline,
                location: previewCard.location,
                avatarUrl: previewCard.avatarUrl,
                themeColor: previewCard.themeColor,
                phone: previewCard.phone,
                email: previewCard.email,
                mode: previewCard.mode,
                redirectUrl: previewCard.redirectUrl,
                isActive: previewCard.isActive,
                slug: previewCard.slug,
                views: previewCard.views,
                vcardClicks: previewCard.vcardClicks,
                links: previewCard.links,
              }
            : null
        }
      />

      {/* Edit Card Slot Modal */}
      <CardEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingCard}
        onSave={handleSaveCard}
        onLiveChange={() => {}}
      />
    </div>
  );
}
