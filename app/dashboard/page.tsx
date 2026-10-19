"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Plus,
  Download,
  Users,
  CreditCard,
  Sparkles,
} from "lucide-react";
import KPICards from "@/components/dashboard/KPICards";
import CardsTable from "@/components/dashboard/CardsTable";
import LivePhonePreview from "@/components/dashboard/LivePhonePreview";
import CardEditorModal from "@/components/dashboard/CardEditorModal";
import { useDashboardNav } from "@/app/dashboard/layout";
import {
  getCards,
  getAnalyticsSummary,
  createCard,
  updateCard,
  deleteCard,
  exportCardsToCSV,
  CardListItem,
  AnalyticsSummary,
  CardFormData,
} from "@/actions/card-actions";

import QRStudioView from "@/components/dashboard/QRStudioView";
import BulkToolsView from "@/components/dashboard/BulkToolsView";
import CompanyProfileView from "@/components/dashboard/CompanyProfileView";
import CardThemesView from "@/components/dashboard/CardThemesView";

export default function DashboardPage() {
  const { currentView, setCurrentView } = useDashboardNav();
  const [cards, setCards] = useState<CardListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalCards: 0,
    totalActive: 0,
    totalTaps: 0,
    topPerformer: null,
    tapThroughRate: 0,
  });

  // Selected Card for Live Preview (right panel)
  const [selectedCard, setSelectedCard] = useState<CardListItem | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardListItem | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // Load Cards & Analytics
  const loadData = (p = page, q = searchQuery, d = selectedDept, s = statusFilter) => {
    startTransition(async () => {
      const [res, stats] = await Promise.all([
        getCards({ page: p, limit: 20, search: q, department: d, status: s }),
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
        } else {
          setSelectedCard(null);
        }
      }
    });
  };

  useEffect(() => {
    loadData(1, "", "all", "all");
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData(1, searchQuery, selectedDept, statusFilter);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedDept, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData(newPage, searchQuery, selectedDept, statusFilter);
  };

  const handleOpenCreate = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleEdit = (card: CardListItem) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCard(id);
    loadData(page, searchQuery, selectedDept, statusFilter);
  };

  const handleSaveCard = async (data: CardFormData, id?: string) => {
    if (id) {
      const res = await updateCard(id, data);
      if (res.success) {
        loadData(page, searchQuery, selectedDept, statusFilter);
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to update card" };
    } else {
      const res = await createCard(data);
      if (res.success) {
        loadData(1, searchQuery, selectedDept, statusFilter);
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to create card" };
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportCardsToCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reach_World_NFC_${new Date().toISOString().slice(0, 10)}.csv`);
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
      {currentView === "qr_studio" ? (
        <QRStudioView
          cards={cards}
          onBackToRegistry={() => setCurrentView("cards")}
        />
      ) : currentView === "bulk_tools" ? (
        <BulkToolsView
          cards={cards}
          onBackToRegistry={() => setCurrentView("cards")}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />
      ) : currentView === "company_profile" ? (
        <CompanyProfileView
          onBackToRegistry={() => setCurrentView("cards")}
        />
      ) : currentView === "templates" ? (
        <CardThemesView
          onBackToRegistry={() => setCurrentView("cards")}
        />
      ) : currentView === "analytics" ? (
        <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-black/[0.05]">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                Cards Interaction Analytics
              </h2>
              <p className="text-xs text-[#86868B] mt-1 font-medium">
                Real-time performance and NFC engagement metrics across Reach World.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("cards")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors"
            >
              Back to Registry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Average Taps per Card
              </span>
              <div className="text-3xl font-extrabold text-[#1D1D1F] mt-2">
                {analytics.totalCards > 0
                  ? Math.round(analytics.totalTaps / analytics.totalCards)
                  : 0}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Active NFC Proportion
              </span>
              <div className="text-3xl font-extrabold text-[#0F172A] mt-2">
                {analytics.totalCards > 0
                  ? Math.round((analytics.totalActive / analytics.totalCards) * 100)
                  : 100}
                %
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-xs text-[#86868B] font-semibold uppercase tracking-wider">
                Contact Saves Conversion
              </span>
              <div className="text-3xl font-extrabold text-[#0F172A] mt-2">
                {analytics.tapThroughRate}%
              </div>
            </div>
          </div>
        </div>
      ) : currentView === "departments" ? (
        <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-black/[0.05]">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                Departments Overview
              </h2>
              <p className="text-xs text-[#86868B] mt-1 font-medium">
                Filter and manage employee cards by department division.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDept("all");
                setCurrentView("cards");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors"
            >
              Reset to All
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#86868B]">
              Departments will automatically appear here once employee cards are created.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {departments.map((dept) => (
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
                    <span className="text-xs text-[#86868B]">Click to filter</span>
                  </div>
                  <Users className="w-5 h-5 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default: Cards Registry */
        <>
          {/* Action Control Bar */}
          <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search employees, slugs, or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
              />
            </div>

            {/* Apple Segmented Filter */}
            <div className="flex items-center gap-3">
              <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center border border-black/[0.04]">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "all"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "active"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("paused")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "paused"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Paused
                </button>
              </div>

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
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                disabled={isExporting || cards.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/[0.05] text-[#1D1D1F] border border-black/10 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Export CSV for NFC Printing Factory"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create Card
              </button>
            </div>
          </div>

          {/* Main Grid: Cards Table (Left) + iPhone 16 Pro Mockup (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 xl:col-span-8">
              <CardsTable
                cards={cards}
                total={total}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onSelectForPreview={(card) => setSelectedCard(card)}
                selectedCardId={selectedCard?._id}
                onEditCard={handleEdit}
                onDeleteCard={handleDelete}
              />
            </div>

            <div className="lg:col-span-4 xl:col-span-4 flex justify-center">
              {selectedCard ? (
                <LivePhonePreview
                  card={{
                    name: selectedCard.name,
                    jobTitle: selectedCard.jobTitle,
                    department: selectedCard.department,
                    headline: selectedCard.headline,
                    location: selectedCard.location,
                    avatarUrl: selectedCard.avatarUrl,
                    themeColor: selectedCard.themeColor,
                    phone: (selectedCard as any).phone,
                    email: (selectedCard as any).email,
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
                    Create or select a card to preview its real-time Reach World mobile view.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Card Drawer Modal */}
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
