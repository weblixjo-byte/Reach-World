"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Upload,
  Check,
} from "lucide-react";
import { LinkIconType } from "@/models/Card";
import { CardFormData } from "@/actions/card-actions";
import { formatSlug } from "@/lib/slugify";

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (CardFormData & { _id?: string }) | null;
  onSave: (data: CardFormData, id?: string) => Promise<boolean>;
  onLiveChange?: (data: CardFormData) => void;
}

const ICON_OPTIONS: { label: string; value: LinkIconType }[] = [
  { label: "Website", value: "website" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Google Maps", value: "maps" },
  { label: "Phone", value: "phone" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Custom Link", value: "custom" },
];

const THEME_COLORS = [
  { name: "Reach Teal", hex: "#2594a3" },
  { name: "Apple Blue", hex: "#0071E3" },
  { name: "Apple Green", hex: "#34C759" },
  { name: "Indigo Velvet", hex: "#5856D6" },
  { name: "Sunset Orange", hex: "#FF9500" },
  { name: "Midnight Onyx", hex: "#1D1D1F" },
];

export default function CardEditorModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onLiveChange,
}: CardEditorModalProps) {
  const isEditing = Boolean(initialData?._id);

  const [formData, setFormData] = useState<CardFormData>(() => ({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    jobTitle: initialData?.jobTitle || "",
    department: initialData?.department || "General",
    headline: initialData?.headline || "",
    location: initialData?.location || "Dubai, UAE",
    avatarUrl: initialData?.avatarUrl || "",
    themeColor: initialData?.themeColor || "#2594a3",
    isActive: initialData?.isActive ?? true,
    links: initialData?.links || [],
  }));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const updateField = (key: keyof CardFormData, value: any) => {
    const updated = { ...formData, [key]: value };
    // Auto sync slug if user is creating a card and changing name
    if (key === "name" && !isEditing && (!formData.slug || formData.slug === formatSlug(formData.name))) {
      updated.slug = formatSlug(value);
    }
    setFormData(updated);
    if (onLiveChange) {
      onLiveChange(updated);
    }
  };

  const handleAddLink = () => {
    const newLink = {
      title: "",
      url: "",
      icon: "website" as LinkIconType,
      isActive: true,
      clicks: 0,
    };
    const updatedLinks = [...(formData.links || []), newLink];
    updateField("links", updatedLinks);
  };

  const handleUpdateLink = (index: number, field: string, val: any) => {
    const updatedLinks = [...(formData.links || [])];
    updatedLinks[index] = { ...updatedLinks[index], [field]: val };
    updateField("links", updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = (formData.links || []).filter((_, i) => i !== index);
    updateField("links", updatedLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Employee name is required.");
      return;
    }

    setSaving(true);
    try {
      const ok = await onSave(formData, initialData?._id);
      if (ok) {
        onClose();
      } else {
        setErrorMsg("Failed to save card. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/[0.08] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-[#FBFBFD]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
            <h2 className="text-base font-semibold text-[#1D1D1F]">
              {isEditing ? `Edit Card: ${initialData?.name}` : "Create New Reach World Card"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Section: Basic Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-3">
              Employee & Card Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmad Khalil"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  URL Slug <span className="text-xs text-[#86868B]">(English or Arabic)</span>
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-[#86868B] bg-black/[0.03] px-2.5 py-2 border border-r-0 border-black/10 rounded-l-xl">
                    reachworld.com/
                  </span>
                  <input
                    type="text"
                    placeholder="ahmad-khalil"
                    value={formData.slug}
                    onChange={(e) => updateField("slug", formatSlug(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-r-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Managing Director"
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales, Operations, HR, Management"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dubai, UAE"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Avatar / Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatarUrl}
                  onChange={(e) => updateField("avatarUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                Headline / Bio Quote
              </label>
              <textarea
                rows={2}
                placeholder="Brief professional tagline displayed on card..."
                value={formData.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
              />
            </div>
          </div>

          {/* Section: Theme Color & Active State */}
          <div className="pt-4 border-t border-black/[0.06]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-3">
              Appearance & Status
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-medium text-[#1D1D1F] mb-2">
                  Theme Accent
                </span>
                <div className="flex items-center gap-2">
                  {THEME_COLORS.map((clr) => (
                    <button
                      key={clr.hex}
                      type="button"
                      onClick={() => updateField("themeColor", clr.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        formData.themeColor === clr.hex
                          ? "border-[#1D1D1F] scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: clr.hex }}
                      title={clr.name}
                    >
                      {formData.themeColor === clr.hex && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={formData.themeColor || "#2594a3"}
                    onChange={(e) => updateField("themeColor", e.target.value)}
                    className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer overflow-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#1D1D1F]">
                  Card Status:
                </span>
                <button
                  type="button"
                  onClick={() => updateField("isActive", !formData.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-[#34C759]" : "bg-black/20"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      formData.isActive ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs text-[#86868B]">
                  {formData.isActive ? "Active (Online)" : "Paused"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Dynamic Bio Links */}
          <div className="pt-4 border-t border-black/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
                  Interactive Action Links ({formData.links?.length || 0})
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  Add WhatsApp, corporate links, maps, and social profiles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 rounded-xl bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-3">
              {(formData.links || []).map((link, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-[#FBFBFD] border border-black/[0.06] rounded-2xl flex flex-col md:flex-row items-center gap-3"
                >
                  <select
                    value={link.icon}
                    onChange={(e) => handleUpdateLink(index, "icon", e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Link Label (e.g. WhatsApp Direct)"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(index, "title", e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />

                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/[0.06] bg-[#FBFBFD]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {saving ? "Saving to Cloud..." : isEditing ? "Update Card" : "Deploy Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
