"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Download,
  Users,
  CreditCard,
  Layers,
  Link as LinkIcon,
  UserCheck,
  LayoutGrid,
  List,
  ExternalLink,
  Eye,
  Radio,
  Pencil,
  RotateCcw,
} from "lucide-react";
import KPICards from "@/components/dashboard/KPICards";
import CardsTable from "@/components/dashboard/CardsTable";
import LivePhonePreview from "@/components/dashboard/LivePhonePreview";
import CardEditorModal from "@/components/dashboard/CardEditorModal";
import { useDashboardNav } from "@/app/dashboard/layout";
import {
  getCards,
  getAnalyticsSummary,
  updateCard,
  exportCardsToCSV,
  CardListItem,
  AnalyticsSummary,
  CardFormData,
} from "@/actions/card-actions";

import BulkToolsView from "@/components/dashboard/BulkToolsView";

export default function DashboardPage() {
  const { currentView, setCurrentView } = useDashboardNav();
  const [cards, setCards] = useState<CardListItem[]>([]);
  const [total, setTotal] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all"); // 'all' | 'profile' | 'redirect'
  const [viewMode, setViewMode] = useState<"table" | "rack">("table"); // Table vs Visual NFC Rack

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalCards: 50,
    totalActive: 50,
    totalTaps: 0,
    totalRedirects: 0,
    totalProfiles: 50,
    topPerformer: null,
    tapThroughRate: 0,
    recentTaps: [],
  });

  // Selected Card for Live Preview (right panel)
  const [selectedCard, setSelectedCard] = useState<CardListItem | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardListItem | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // Load Cards & Analytics
  const loadData = (
    p = page,
    q = searchQuery,
    d = selectedDept,
    s = statusFilter,
    m = modeFilter
  ) => {
    startTransition(async () => {
      const [res, stats] = await Promise.all([
        getCards({ page: p, limit: 50, search: q, department: d, status: s, mode: m }),
        getAnalyticsSummary(),
      ]);

      setCards(res.cards);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setDepartments(res.departments);
      setAnalytics(stats);

      if (!selectedCard && res.cards.length > 0) {
        setSelectedCard(res.cards[0]);
      } else if (selectedCard) {
        const updatedSelected = res.cards.find((c) => c._id === selectedCard._id);
        if (updatedSelected) {
          setSelectedCard(updatedSelected);
        } else if (res.cards.length > 0) {
          setSelectedCard(res.cards[0]);
        }
      }
    });
  };

  useEffect(() => {
    loadData(1, "", "all", "all", "all");
  }, []);

  // Debounced search & filter trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData(1, searchQuery, selectedDept, statusFilter, modeFilter);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedDept, statusFilter, modeFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData(newPage, searchQuery, selectedDept, statusFilter, modeFilter);
  };

  const handleEdit = (card: CardListItem) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSaveCard = async (data: CardFormData, id?: string) => {
    if (id) {
      const res = await updateCard(id, data);
      if (res.success) {
        loadData(page, searchQuery, selectedDept, statusFilter, modeFilter);
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to update card" };
    }
    return { success: false, error: "System is locked to 50 fixed cards." };
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportCardsToCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Reach_World_50_NFC_Cards_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-7">
      {/* Top Metric Cards */}
      <KPICards analytics={analytics} />

      {/* View switching based on sidebar */}
      {currentView === "bulk_tools" ? (
        <BulkToolsView
          cards={cards}
          onBackToRegistry={() => setCurrentView("cards")}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />
      ) : currentView === "analytics" ? (
        /* ADVANCED ANALYTICS CONSOLE */
        <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                NFC Interaction & Real-Time Telemetry
              </h2>
              <p className="text-xs text-[#86868B] mt-1 font-medium">
                Live monitoring for the 50 hardware cards across Amman and international taps.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("cards")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer"
            >
              Back to 50 Cards Registry
            </button>
          </div>

          {/* Top 3 Analytical KPI Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Average Taps per NFC Chip
              </span>
              <div className="text-3xl font-extrabold text-[#1D1D1F] mt-2">
                {analytics.totalCards > 0
                  ? Math.round(analytics.totalTaps / analytics.totalCards)
                  : 0}
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">Calculated across 50 hardware cards</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Active NFC Status
              </span>
              <div className="text-3xl font-extrabold text-[#0a192f] mt-2">
                {analytics.totalCards > 0
                  ? Math.round((analytics.totalActive / analytics.totalCards) * 100)
                  : 100}
                %
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">{analytics.totalActive} active / 50 slots</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Direct Redirect Share
              </span>
              <div className="text-3xl font-extrabold text-[#0071E3] mt-2">
                {analytics.totalCards > 0
                  ? Math.round((analytics.totalRedirects / analytics.totalCards) * 100)
                  : 0}
                %
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">{analytics.totalRedirects} cards route directly</p>
            </div>
          </div>

          {/* Live Recent Taps Stream & Top Cards Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent NFC Taps Activity */}
            <div className="p-6 rounded-2xl bg-[#FBFBFD] border border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse" />
                  Recent Real-Time NFC Taps
                </h3>
                <span className="text-[11px] text-[#86868B] font-medium">Live Activity</span>
              </div>

              {analytics.recentTaps && analytics.recentTaps.length > 0 ? (
                <div className="space-y-2.5">
                  {analytics.recentTaps.map((tap, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-black/[0.04] flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0a192f] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                          #{tap.cardNumber < 10 ? `0${tap.cardNumber}` : tap.cardNumber}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1D1D1F]">
                            {tap.cardName}
                          </div>
                          <div className="text-[10px] text-[#86868B] font-medium">
                            {tap.mode === "redirect" ? "Direct URL Forward" : "Bio Profile View"}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#86868B] font-mono">
                        {new Date(tap.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#86868B]">
                  No NFC tap events recorded recently. Tap any physical card to view activity here!
                </div>
              )}
            </div>

            {/* Top Cards Leaderboard */}
            <div className="p-6 rounded-2xl bg-[#FBFBFD] border border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0071E3]" />
                  Top Cards Leaderboard
                </h3>
                <span className="text-[11px] text-[#86868B] font-medium">By Taps</span>
              </div>

              <div className="space-y-2.5">
                {cards
                  .slice()
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 6)
                  .map((c, rank) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-xl bg-white border border-black/[0.04] flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-[#86868B] w-4">
                          {rank + 1}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-[#0a192f] text-white flex items-center justify-center font-mono text-[11px] font-bold">
                          #{c.cardNumber < 10 ? `0${c.cardNumber}` : c.cardNumber}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1D1D1F]">{c.name}</div>
                          <div className="text-[10px] text-[#86868B]">
                            {c.mode === "redirect" ? `URL: ${c.redirectUrl || "None"}` : c.department}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0071E3] font-mono">
                          {c.views.toLocaleString()} taps
                        </span>
                        <a
                          href={`/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-black/5 text-[#86868B]"
                          title="Open Card"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : currentView === "departments" ? (
        /* DEPARTMENTS OVERVIEW */
        <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-black/[0.05]">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                Departments Overview (50 Cards)
              </h2>
              <p className="text-xs text-[#86868B] mt-1 font-medium">
                Filter and inspect employee cards by company division.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDept("all");
                setCurrentView("cards");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors cursor-pointer"
            >
              Reset to All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const countInDept = cards.filter((c) => c.department === dept).length;
              return (
                <div
                  key={dept}
                  onClick={() => {
                    setSelectedDept(dept);
                    setCurrentView("cards");
                  }}
                  className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.06] hover:border-[#0071E3]/50 cursor-pointer transition-all hover:shadow-md flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                      {dept}
                    </h4>
                    <span className="text-xs text-[#86868B] font-medium">
                      {countInDept} Cards assigned
                    </span>
                  </div>
                  <Users className="w-5 h-5 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MAIN VIEW: 50 FIXED CARDS REGISTRY */
        <>
          {/* Action Control Bar */}
          <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
            {/* Smart Search Input */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search by Slot # (e.g. 7), Name, or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
              />
            </div>

            {/* Apple Segmented Routing Mode Filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center border border-black/[0.04]">
                <button
                  onClick={() => setModeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    modeFilter === "all"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setModeFilter("profile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modeFilter === "profile"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Bio Cards</span>
                </button>
                <button
                  onClick={() => setModeFilter("redirect")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modeFilter === "redirect"
                      ? "bg-white text-[#0071E3] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Direct Redirects</span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center border border-black/[0.04]">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Active & Paused
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "active"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Active Only
                </button>
                <button
                  onClick={() => setStatusFilter("paused")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "paused"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Paused
                </button>
              </div>

              {/* Department Dropdown */}
              {departments.length > 0 && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-black/10 bg-[#FBFBFD] text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              )}

              {/* View Switcher (Table vs Visual NFC Rack) */}
              <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center border border-black/[0.04]">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("rack")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "rack"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                  title="50-Card Visual Hardware Rack View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Export CSV Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={isExporting || cards.length === 0}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0a192f] hover:bg-[#13284c] text-white flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                title="Download 50 Cards Export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? "Exporting..." : "Export 50 Cards (CSV)"}</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Cards Table / Rack (Left) + iPhone 16 Pro Mockup (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-8">
              {viewMode === "table" ? (
                /* Standard Table View */
                <CardsTable
                  cards={cards}
                  total={total}
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onSelectForPreview={(card) => setSelectedCard(card)}
                  selectedCardId={selectedCard?._id}
                  onEditCard={handleEdit}
                  onResetSuccess={() => loadData(page, searchQuery, selectedDept, statusFilter, modeFilter)}
                />
              ) : (
                /* VISUAL 50-CARD NFC HARDWARE RACK VIEW */
                <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                    <div>
                      <h3 className="text-sm font-bold text-[#1D1D1F]">
                        50 Physical NFC Cards Rack
                      </h3>
                      <p className="text-xs text-[#86868B]">
                        Click any card slot to inspect, test or configure its destination.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#0a192f] bg-[#0a192f]/5 px-3 py-1.5 rounded-xl">
                      Slots 01 - 50
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {cards.map((card) => {
                      const isSelected = selectedCard?._id === card._id;
                      const isRedirect = card.mode === "redirect";
                      const padded = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;

                      return (
                        <div
                          key={card._id}
                          onClick={() => setSelectedCard(card)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                            isSelected
                              ? "bg-[#0071E3]/5 border-[#0071E3] shadow-md ring-2 ring-[#0071E3]/20"
                              : "bg-[#FBFBFD] border-black/[0.08] hover:border-[#0071E3]/50 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-mono text-xs font-black text-[#0a192f] bg-[#0a192f]/10 px-2 py-0.5 rounded-lg">
                              #{padded}
                            </span>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                card.isActive ? "bg-[#34C759]" : "bg-black/20"
                              }`}
                              title={card.isActive ? "Active" : "Paused"}
                            />
                          </div>

                          <div className="my-1 min-w-0">
                            <h4 className="font-bold text-xs text-[#1D1D1F] truncate" title={card.name}>
                              {card.name}
                            </h4>
                            <p className="text-[10px] text-[#86868B] truncate">
                              {isRedirect ? "Direct Redirect" : card.jobTitle || "Bio Card"}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#0071E3] font-mono">
                              {card.views} taps
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(card);
                              }}
                              className="p-1 rounded-md hover:bg-black/5 text-[#86868B] hover:text-[#0071E3]"
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

            {/* iPhone 16 Pro Live Mockup (Right) */}
            <div className="lg:col-span-4 xl:col-span-4 flex justify-center">
              {selectedCard ? (
                <LivePhonePreview
                  card={{
                    cardNumber: selectedCard.cardNumber,
                    name: selectedCard.name,
                    jobTitle: selectedCard.jobTitle,
                    department: selectedCard.department,
                    headline: selectedCard.headline,
                    location: selectedCard.location,
                    avatarUrl: selectedCard.avatarUrl,
                    themeColor: selectedCard.themeColor,
                    phone: selectedCard.phone,
                    email: selectedCard.email,
                    mode: selectedCard.mode,
                    redirectUrl: selectedCard.redirectUrl,
                    isActive: selectedCard.isActive,
                    slug: selectedCard.slug,
                    links: selectedCard.links,
                  }}
                />
              ) : (
                <div className="w-[340px] bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Live Card Preview
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Select any of the 50 cards to preview its real-time mobile view or redirect behavior.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Card Slot Drawer Modal */}
      <CardEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingCard}
        onSave={handleSaveCard}
        onLiveChange={(data) => {
          if (selectedCard) {
            setSelectedCard((prev) => (prev ? { ...prev, ...data } : null));
          }
        }}
      />
    </div>
  );
}
