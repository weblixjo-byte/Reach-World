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
import ModernDropdown from "@/components/dashboard/ModernDropdown";
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
        <FleetAnalyticsView
          cards={allCards}
          analytics={analytics}
          selectedCardId={analyticsCardId}
          onSelectCard={(id) => setAnalyticsCardId(id)}
          onBackToRegistry={() => setCurrentView("cards")}
          onEditCard={(card) => handleEdit(card)}
        />
      ) : (
        /* MAIN REGISTRY VIEW (FULL WIDTH) */
        <div className="space-y-4">
          {/* Corporate Header & Toolbar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  50 Cards Registry
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Switcher (Table vs Rack) */}
                <div className="bg-slate-100/90 p-0.5 rounded-xl flex items-center border border-slate-200/80">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode("rack")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === "rack"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-900"
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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200/80 text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40"
                  title="Export 50 cards to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#0A192F]" />
                  <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                </button>
              </div>
            </div>

            {/* Clean Single-Row Search & Filter Bar - Executive Light */}
            <div className="rounded-2xl bg-white p-3 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap lg:flex-nowrap items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards by slot, employee, or link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-800 focus:bg-white focus:outline-none transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Mode Filter Pills */}
              <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                <button
                  onClick={() => setModeFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setModeFilter("profile")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "profile"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Bio Profiles
                </button>
                <button
                  onClick={() => setModeFilter("redirect")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "redirect"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Custom Links
                </button>
              </div>

              {/* Modern Status Dropdown */}
              <ModernDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active Only" },
                  { value: "paused", label: "Paused Only" },
                ]}
              />

              {/* Modern Department Dropdown */}
              {departments.length > 0 && (
                <ModernDropdown
                  value={selectedDept}
                  onChange={setSelectedDept}
                  options={[
                    { value: "all", label: "All Departments" },
                    ...departments.map((dept) => ({ value: dept, label: dept })),
                  ]}
                  searchable
                />
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
              /* Visual 50-Card Hardware Rack View (Full Width) - Executive Light */
              <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      50 Physical NFC Cards Rack
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any card slot to inspect or test its destination.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
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
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                          isSelected
                            ? "bg-slate-100 border-[#0A192F] shadow-sm ring-2 ring-slate-900/10"
                            : "bg-slate-50/60 border-slate-200/80 hover:border-slate-400 hover:bg-white hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-bold font-mono text-[#0F172A] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            #{padded}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              card.isActive ? "bg-[#0A192F]" : "bg-slate-300"
                            }`}
                            title={card.isActive ? "Active" : "Paused"}
                          />
                        </div>

                        <div className="my-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate" title={card.name}>
                            {card.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {isRedirect ? "Custom Link" : card.jobTitle || "Digital Profile"}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#0F172A] font-mono">
                            {card.views} taps
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(card);
                            }}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
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
