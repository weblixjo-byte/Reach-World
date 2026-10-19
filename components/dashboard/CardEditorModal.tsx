"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { LinkIconType } from "@/models/Card";
import { CardFormData } from "@/actions/card-actions";
import { formatSlug } from "@/lib/slugify";
import { SocialIcon } from "@/components/icons/SocialIcons";

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (CardFormData & { _id?: string }) | null;
  onSave: (data: CardFormData, id?: string) => Promise<boolean>;
  onLiveChange?: (data: CardFormData) => void;
}

const ICON_OPTIONS: { label: string; value: LinkIconType }[] = [
  { label: "Phone Call", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email Address", value: "email" },
  { label: "Official Website", value: "website" },
  { label: "Office / Location Map", value: "maps" },
  { label: "LinkedIn (Social Pill)", value: "linkedin" },
  { label: "Instagram (Social Pill)", value: "instagram" },
  { label: "Facebook (Social Pill)", value: "facebook" },
  { label: "X / Twitter (Social Pill)", value: "twitter" },
  { label: "Custom Link", value: "custom" },
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
    jobTitle: initialData?.jobTitle || "REACH WORLD",
    department: initialData?.department || "Corporate",
    headline: initialData?.headline || "",
    location: initialData?.location || "Amman, Jordan",
    avatarUrl: initialData?.avatarUrl || "",
    themeColor: initialData?.themeColor || "#0a192f",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    isActive: initialData?.isActive ?? true,
    links: initialData?.links || [
      { title: "Call Direct", subtitle: "+962 7 9000 0000", url: "tel:+962790000000", icon: "phone", isActive: true, clicks: 0 },
      { title: "Chat on WhatsApp", subtitle: "Quick Response", url: "https://wa.me/962790000000", icon: "whatsapp", isActive: true, clicks: 0 },
      { title: "Send Email", subtitle: "info@reachworld.com", url: "mailto:info@reachworld.com", icon: "email", isActive: true, clicks: 0 },
      { title: "Official Website", subtitle: "reachworld.com", url: "https://reachworld.com", icon: "website", isActive: true, clicks: 0 },
      { title: "Headquarters & Office", subtitle: "Amman, Jordan", url: "https://maps.google.com", icon: "maps", isActive: true, clicks: 0 },
      { title: "LinkedIn", subtitle: "Company Profile", url: "https://linkedin.com", icon: "linkedin", isActive: true, clicks: 0 },
      { title: "Instagram", subtitle: "Instagram Profile", url: "https://instagram.com", icon: "instagram", isActive: true, clicks: 0 },
      { title: "Facebook", subtitle: "Facebook Page", url: "https://facebook.com", icon: "facebook", isActive: true, clicks: 0 },
      { title: "X", subtitle: "X Profile", url: "https://x.com", icon: "twitter", isActive: true, clicks: 0 },
    ],
  }));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const updateField = (key: keyof CardFormData, value: any) => {
    const updated = { ...formData, [key]: value };
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
      title: "New Link",
      subtitle: "",
      url: "https://",
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
              {isEditing ? `Edit Reach Card: ${initialData?.name}` : "Create New Reach World NFC Card"}
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
              Employee Identity & Branding
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Alseidi"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-[#86868B] bg-black/[0.03] px-2.5 py-2 border border-r-0 border-black/10 rounded-l-xl">
                    reachworld.com/
                  </span>
                  <input
                    type="text"
                    placeholder="mohammad-alseidi"
                    value={formData.slug}
                    onChange={(e) => updateField("slug", formatSlug(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-r-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Subtitle / Company Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. REACH WORLD"
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
                  placeholder="e.g. Management, Sales, Operations"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Direct Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+962 7 9000 0000"
                  value={formData.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  placeholder="m.alseidi@reachworld.com"
                  value={formData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>
            </div>
          </div>

          {/* Section: Action Links & Social Badges */}
          <div className="pt-4 border-t border-black/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
                  Direct Contact Buttons & Social Icons ({formData.links?.length || 0})
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  Configured according to the Reach World Dark Blue Template.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 rounded-xl bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Action Button
              </button>
            </div>

            <div className="space-y-3">
              {(formData.links || []).map((link, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-[#FBFBFD] border border-black/[0.06] rounded-2xl flex flex-col md:flex-row items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-[#0071E3]">
                      <SocialIcon type={link.icon} className="w-4 h-4" />
                    </div>
                    <select
                      value={link.icon}
                      onChange={(e) => handleUpdateLink(index, "icon", e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Title (e.g. Call Mohammad Alseidi)"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(index, "title", e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />

                  <input
                    type="text"
                    placeholder="Subtitle (e.g. +962 7 9000 0000)"
                    value={link.subtitle || ""}
                    onChange={(e) => handleUpdateLink(index, "subtitle", e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />

                  <input
                    type="text"
                    placeholder="Action URL (tel:, mailto:, https:)"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                    title="Remove item"
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
            {saving ? "Deploying..." : isEditing ? "Save & Update Card" : "Deploy Reach Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
