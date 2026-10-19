"use client";

import React, { useState } from "react";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { CardListItem, importCardsFromCSV } from "@/actions/card-actions";

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
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Full comprehensive 200-employee company template with all communication types
  const handleDownloadSample = () => {
    const headers = [
      "Name",
      "Job Title",
      "Department",
      "Phone",
      "Email",
      "Location",
      "Website",
      "LinkedIn",
      "Instagram",
      "Facebook",
      "X",
    ];

    const sampleRows = [
      [
        "Mohammad Faraj Alseidi",
        "Managing Director",
        "Executive Management",
        "0797649615",
        "m.alseidi@reachworld.com",
        "Amman, Jordan",
        "reachworld.com",
        "https://linkedin.com/in/mohammad-alseidi",
        "mohammad_alseidi",
        "mohammad.alseidi",
        "m_alseidi",
      ],
      [
        "Ahmad Al-Qasim",
        "Operations Specialist",
        "Operations",
        "0791234567",
        "ahmad.qasim@reachworld.com",
        "Amman, Jordan",
        "",
        "",
        "ahmad_qasim",
        "",
        "",
      ],
      [
        "Rania Al-Khatib",
        "Client Success Lead",
        "Customer Support",
        "0798765432",
        "rania@reachworld.com",
        "",
        "",
        "https://linkedin.com/in/rania-khatib",
        "",
        "",
        "",
      ],
    ];

    const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
    const csvContent =
      headers.join(",") +
      "\r\n" +
      sampleRows.map((row) => row.map(escape).join(",")).join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Reach_World_Employees_Import_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse simple CSV line with quotes support
    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ""));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || !values[0]) continue;

      const obj: any = {};
      headers.forEach((h, idx) => {
        const val = values[idx] || "";
        if (h.includes("name")) obj.name = val;
        else if (h.includes("title") || h.includes("job") || h.includes("role")) obj.jobTitle = val;
        else if (h.includes("dept") || h.includes("department")) obj.department = val;
        else if (h.includes("phone") || h.includes("mobile") || h.includes("tel")) obj.phone = val;
        else if (h.includes("email") || h.includes("mail")) obj.email = val;
        else if (h.includes("location") || h.includes("office") || h.includes("city")) obj.location = val;
        else if (h.includes("web") || h.includes("site") || h.includes("url")) obj.website = val;
        else if (h.includes("linkedin")) obj.linkedin = val;
        else if (h.includes("instagram") || h.includes("insta")) obj.instagram = val;
        else if (h.includes("facebook")) obj.facebook = val;
        else if (h.includes("twitter") || h === "x") obj.twitter = val;
      });

      if (obj.name && obj.name.trim()) {
        records.push(obj);
      }
    }

    return records;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const rows = parseCSV(content);
      setParsedRows(rows);
      setParseStatus(`Detected ${rows.length} valid employee rows ready for batch processing.`);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await importCardsFromCSV(parsedRows);
      if (res.success) {
        setImportResult(`Successfully generated and imported ${res.count} employee cards into Reach World.`);
        setParsedRows([]);
        setParseStatus(null);
      } else {
        setImportResult(`Import error: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setImportResult(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-black/[0.05] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F172A]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Bulk Data & 200+ Employee Factory Tools
            </h2>
          </div>
          <p className="text-xs text-[#86868B] mt-1 font-medium">
            Export corporate records for bulk NFC card manufacturing or import team batches directly via full CSV template.
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
              Downloads complete employee directory including name, role, department, public URLs, and QR links. Ready for batch chip encoding (NTAG213 / NTAG215).
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
              Batch 200+ Employee Import (Full CSV Template)
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Upload an Excel/CSV spreadsheet to batch generate NFC cards for all company employees at once. Supports all channels (Phone, WhatsApp, Email, LinkedIn, Instagram, Maps, Website, Facebook, X). Empty channels are skipped automatically.
            </p>

            <button
              onClick={handleDownloadSample}
              className="text-xs text-[#0071E3] font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Full 200-Employee CSV Template
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
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-medium border border-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>{parseStatus}</span>
                </div>
                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting}
                  className="px-3 py-1.5 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : "Start Import"}
                </button>
              </div>
            )}

            {importResult && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-medium border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
