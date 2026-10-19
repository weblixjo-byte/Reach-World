"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
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
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'paused'

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalCards: 0,
    totalActive: 0,
    totalTaps: 0,
    topPerformer: null,
    tapThroughRate: 88.4,
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
      link.setAttribute("download", `Reach_World_NFC_Batch_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* KPI Row (Always visible or on analytics) */}
      <KPICards analytics={analytics} />

      {/* Render based on Sidebar Selection */}
      {currentView === "analytics" ? (
        <div className="space-y-6">
          <div className="apple-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-[#1D1D1F]">
                  Edge Analytics & Tap Telemetry
                </h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Real-time visitor interactions served directly from Vercel Edge & MongoDB Atlas.
                </p>
              </div>
              <button
                onClick={() => setCurrentView("cards")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0071E3] text-white"
              >
                Back to Cards
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/5">
                <span className="text-xs text-[#86868B] font-medium">Average Taps per Card</span>
                <div className="text-2xl font-bold text-[#1D1D1F] mt-1">
                  {analytics.totalCards > 0
                    ? Math.round(analytics.totalTaps / analytics.totalCards)
                    : 0}{" "}
                  <span className="text-xs font-normal text-[#86868B]">taps/employee</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/5">
                <span className="text-xs text-[#86868B] font-medium">Cache Hit Ratio</span>
                <div className="text-2xl font-bold text-[#34C759] mt-1">
                  99.4% <span className="text-xs font-normal text-[#86868B]">Edge ISR Cached</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/5">
                <span className="text-xs text-[#86868B] font-medium">vCard Add-to-Contacts Conversion</span>
                <div className="text-2xl font-bold text-[#0071E3] mt-1">
                  {analytics.tapThroughRate}% <span className="text-xs font-normal text-[#86868B]">conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : currentView === "departments" ? (
        <div className="apple-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">
                Reach World Departments ({departments.length})
              </h2>
              <p className="text-xs text-[#86868B] mt-0.5">
                Click any department to instantly filter and manage related employee NFC cards.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDept("all");
                setCurrentView("cards");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10"
            >
              Reset to All
            </button>
          </div>

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
                  <h4 className="font-semibold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                    {dept}
                  </h4>
                  <span className="text-xs text-[#86868B]">Corporate Division</span>
                </div>
                <Users className="w-5 h-5 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
              </div>
            ))}
          </div>
        </div>
      ) : currentView === "settings" ? (
        <div className="apple-card rounded-2xl p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">
                Reach World NFC Platform Settings
              </h2>
              <p className="text-xs text-[#86868B] mt-0.5">
                Database, Vercel edge caching, and branding configuration.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("cards")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0071E3] text-white"
            >
              Back
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F5F7] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#1D1D1F]">Database Backend</span>
                <p className="text-[#86868B]">MongoDB Atlas Cloud (reach-world cluster)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] font-medium">
                Connected
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F7] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#1D1D1F]">NFC Card Design Template</span>
                <p className="text-[#86868B]">Reach World Signature Dark Blue Glassmorphism</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-medium">
                Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F7] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#1D1D1F]">ISR Revalidation Lifetime</span>
                <p className="text-[#86868B]">Edge cache refreshed every 60 seconds</p>
              </div>
              <span className="font-mono text-[#86868B]">revalidate = 60</span>
            </div>
          </div>
        </div>
      ) : (
        /* Default: Cards Registry */
        <>
          {/* Control Bar: Search + Apple Segmented Control + Actions */}
          <div className="apple-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search 200+ employees, slugs or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
              />
            </div>

            {/* Center: Apple Segmented Control & Department Filter */}
            <div className="flex items-center gap-3">
              <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center border border-black/[0.04]">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === "all"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === "active"
                      ? "bg-white text-[#1D1D1F] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("paused")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

            {/* Actions: Export CSV + Create Card */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/[0.05] text-[#1D1D1F] border border-black/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Export CSV for NFC Printing Factory"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? "Generating..." : "Export CSV"}
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
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
                <div className="apple-card rounded-3xl p-8 text-center text-[#86868B] text-xs">
                  Select an employee card from the registry to view live iPhone preview.
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
