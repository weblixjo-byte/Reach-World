"use client";

import React, { useState } from "react";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { CardListItem } from "@/actions/card-actions";

interface BulkToolsViewProps {
  cards: CardListItem[];
  onBackToRegistry: () => void;
  onExportCSV: () => void;
  isExporting: boolean;
}

export default function BulkToolsView({
  cards,
  onBackToRegistry,
  onExportCSV,
  isExporting,
}: BulkToolsViewProps) {
  const [csvText, setCsvText] = useState("");
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  const handleDownloadSample = () => {
    const sample = `name,jobTitle,department,email,phone,slug
Ali Al-Ahmad,Project Director,Executive,ali@reachworld.com,+962791234567,ali-ahmad
Noor Salem,Senior UI Designer,Product,noor@reachworld.com,+962792345678,noor-salem
Tareq Qasim,NFC Lead Engineer,Engineering,tareq@reachworld.com,+962793456789,tareq-qasim`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Reach_World_Sample_Employees.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const rows = content.trim().split("\n").filter((r) => r.trim().length > 0);
      setParseStatus(`Ready to import ${Math.max(0, rows.length - 1)} employees from file.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F172A]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Bulk Data & Factory Tools
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-medium">
            Export corporate records for bulk NFC card manufacturing or import team batches directly via CSV.
          </p>
        </div>
        <button
          onClick={onBackToRegistry}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F5F7] hover:bg-black/5 text-[#1D1D1F] border border-black/10 transition-colors"
        >
          Back to Cards
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#0F172A] shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Export Full Registry (NFC Factory Format)
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Downloads complete employee directory including name, role, department, public URLs, and tap metrics. Ready for batch chip encoding (NTAG213 / NTAG215).
            </p>
            <div className="text-xs font-semibold text-[#0F172A]">
              Current Registry Count: <span className="text-[#0071E3]">{cards.length} Cards</span>
            </div>
          </div>

          <button
            onClick={onExportCSV}
            disabled={isExporting || cards.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Generating CSV..." : "Download Production CSV"}
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#0F172A] shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Batch Employee Import
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Upload a standard CSV spreadsheet to batch generate NFC cards for entire company teams or new hires at once.
            </p>

            <button
              onClick={handleDownloadSample}
              className="text-xs text-[#0071E3] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
            </button>
          </div>

          <div className="space-y-3">
            <label className="w-full py-3 px-4 rounded-xl border border-dashed border-black/20 hover:border-[#0071E3] bg-white cursor-pointer text-center text-xs font-medium text-[#64748B] hover:text-[#0071E3] transition-all flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose CSV File to Upload</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {parseStatus && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{parseStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
