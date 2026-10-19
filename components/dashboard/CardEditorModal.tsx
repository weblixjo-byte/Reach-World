"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Layers,
} from "lucide-react";
import { LinkIconType } from "@/models/Card";
import { CardFormData } from "@/actions/card-actions";
import { formatSlug } from "@/lib/slugify";
import { SocialIcon } from "@/components/icons/SocialIcons";

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (CardFormData & { _id?: string }) | null;
  onSave: (data: CardFormData, id?: string) => Promise<boolean | { success: boolean; error?: string }>;
  onLiveChange?: (data: CardFormData) => void;
}

export interface CustomLinkItem {
  id: string;
  title: string;
  url: string;
  subtitle?: string;
}

export default function CardEditorModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onLiveChange,
}: CardEditorModalProps) {
  const isEditing = Boolean(initialData?._id);

  // Identity state
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "REACH WORLD");
  const [department, setDepartment] = useState(initialData?.department || "Corporate");

  // Fixed Channels values
  // Find initial values from links or root fields
  const getInitialVal = (icon: string) => {
    const l = (initialData?.links || []).find((x) => x.icon === icon);
    if (!l) return "";
    if (icon === "phone") {
      const p = l.subtitle || l.url.replace(/^tel:\+?962/, "").replace(/^tel:\+?/, "");
      return p.replace(/^\+?962/, "").replace(/^0/, "");
    }
    if (icon === "whatsapp") {
      const wa = l.url.replace(/^https:\/\/wa\.me\/962/, "").replace(/^https:\/\/wa\.me\//, "");
      return wa.replace(/^0/, "");
    }
    if (icon === "email") {
      return l.subtitle || l.url.replace(/^mailto:/, "");
    }
    if (icon === "instagram") {
      return l.subtitle?.replace(/^@/, "") || l.url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
    }
    if (icon === "facebook") {
      return l.subtitle || l.url.replace(/^https?:\/\/(www\.)?facebook\.com\//, "");
    }
    if (icon === "twitter") {
      return l.subtitle?.replace(/^@/, "") || l.url.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "");
    }
    if (icon === "linkedin") {
      return l.url || "";
    }
    if (icon === "maps") {
      return l.url || "";
    }
    if (icon === "website") {
      return l.url || "";
    }
    return l.url || "";
  };

  const [phoneDigits, setPhoneDigits] = useState(() => {
    const fromRoot = (initialData?.phone || "").replace(/^\+?962/, "").replace(/^0/, "");
    return fromRoot || getInitialVal("phone") || "";
  });

  const [waDigits, setWaDigits] = useState(() => {
    return getInitialVal("whatsapp") || (initialData?.phone || "").replace(/^\+?962/, "").replace(/^0/, "") || "";
  });

  const [emailVal, setEmailVal] = useState(() => {
    return initialData?.email || getInitialVal("email") || "";
  });

  const [websiteVal, setWebsiteVal] = useState(() => getInitialVal("website") || "reachworld.com");
  const [mapsVal, setMapsVal] = useState(() => getInitialVal("maps") || "");
  const [linkedinVal, setLinkedinVal] = useState(() => getInitialVal("linkedin") || "");
  const [instagramVal, setInstagramVal] = useState(() => getInitialVal("instagram") || "");
  const [facebookVal, setFacebookVal] = useState(() => getInitialVal("facebook") || "");
  const [twitterVal, setTwitterVal] = useState(() => getInitialVal("twitter") || "");

  // Custom links (only for custom added buttons where user can name the title)
  const [customLinks, setCustomLinks] = useState<CustomLinkItem[]>(() => {
    return (initialData?.links || [])
      .filter((l) => l.icon === "custom")
      .map((l, i) => ({
        id: `custom-${i}`,
        title: l.title || "Custom Link",
        url: l.url || "https://",
        subtitle: l.subtitle || "",
      }));
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Build links array based on the user rules
  const assembleData = (
    currentName = name,
    currentSlug = slug,
    currentJob = jobTitle,
    currentDept = department,
    curPhone = phoneDigits,
    curWa = waDigits,
    curEmail = emailVal,
    curWeb = websiteVal,
    curMaps = mapsVal,
    curLk = linkedinVal,
    curIg = instagramVal,
    curFb = facebookVal,
    curTw = twitterVal,
    curCustoms = customLinks
  ): CardFormData => {
    const links: any[] = [];

    // 1. Phone: starts with +962 automatically
    const cleanPhone = curPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone ? `+962${cleanPhone}` : "";
    if (cleanPhone) {
      links.push({
        title: "Call Direct",
        subtitle: formattedPhone,
        url: `tel:${formattedPhone}`,
        icon: "phone",
        isActive: true,
        clicks: 0,
      });
    }

    // 2. WhatsApp: auto-generates https://wa.me/962...
    const cleanWa = curWa.replace(/\D/g, "");
    if (cleanWa) {
      links.push({
        title: "Chat on WhatsApp",
        subtitle: "Quick Response",
        url: `https://wa.me/962${cleanWa}`,
        icon: "whatsapp",
        isActive: true,
        clicks: 0,
      });
    }

    // 3. Email: auto-generates mailto:...
    if (curEmail.trim()) {
      links.push({
        title: "Send Email",
        subtitle: curEmail.trim(),
        url: `mailto:${curEmail.trim()}`,
        icon: "email",
        isActive: true,
        clicks: 0,
      });
    }

    // 4. Website: paste or default
    if (curWeb.trim()) {
      const fullUrl = curWeb.startsWith("http") ? curWeb.trim() : `https://${curWeb.trim()}`;
      links.push({
        title: "Official Website",
        subtitle: curWeb.replace(/^https?:\/\//, ""),
        url: fullUrl,
        icon: "website",
        isActive: true,
        clicks: 0,
      });
    }

    // 5. Google Maps: paste link
    if (curMaps.trim()) {
      links.push({
        title: "Headquarters & Office",
        subtitle: "Amman, Jordan",
        url: curMaps.trim(),
        icon: "maps",
        isActive: true,
        clicks: 0,
      });
    }

    // 6. LinkedIn: full URL paste
    if (curLk.trim()) {
      const fullLk = curLk.startsWith("http") ? curLk.trim() : `https://${curLk.trim()}`;
      links.push({
        title: "LinkedIn",
        subtitle: "Professional Profile",
        url: fullLk,
        icon: "linkedin",
        isActive: true,
        clicks: 0,
      });
    }

    // 7. Instagram: username only
    const cleanIg = curIg.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
    if (cleanIg) {
      links.push({
        title: "Instagram",
        subtitle: `@${cleanIg}`,
        url: `https://instagram.com/${cleanIg}`,
        icon: "instagram",
        isActive: true,
        clicks: 0,
      });
    }

    // 8. Facebook: username or link
    const cleanFb = curFb.trim();
    if (cleanFb) {
      const fullFb = cleanFb.startsWith("http") ? cleanFb : `https://facebook.com/${cleanFb.replace(/^@/, "")}`;
      links.push({
        title: "Facebook",
        subtitle: "Facebook Page",
        url: fullFb,
        icon: "facebook",
        isActive: true,
        clicks: 0,
      });
    }

    // 9. X (Twitter): username only
    const cleanTw = curTw.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "");
    if (cleanTw) {
      links.push({
        title: "X",
        subtitle: `@${cleanTw}`,
        url: `https://x.com/${cleanTw}`,
        icon: "twitter",
        isActive: true,
        clicks: 0,
      });
    }

    // 10. Custom Links
    curCustoms.forEach((c) => {
      if (c.title.trim() && c.url.trim()) {
        const cUrl = c.url.startsWith("http") ? c.url.trim() : `https://${c.url.trim()}`;
        links.push({
          title: c.title.trim(),
          subtitle: c.subtitle || c.url.replace(/^https?:\/\//, ""),
          url: cUrl,
          icon: "custom",
          isActive: true,
          clicks: 0,
        });
      }
    });

    return {
      name: currentName.trim(),
      slug: currentSlug.trim() || formatSlug(currentName),
      jobTitle: currentJob.trim() || "REACH WORLD",
      department: currentDept.trim() || "Corporate",
      phone: formattedPhone,
      email: curEmail.trim(),
      location: "Amman, Jordan",
      themeColor: "#0a192f",
      isActive: initialData?.isActive ?? true,
      links,
    };
  };

  const triggerLive = (data: CardFormData) => {
    if (onLiveChange) {
      onLiveChange(data);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    let newSlug = slug;
    if (!isEditing && (!slug || slug === formatSlug(name))) {
      newSlug = formatSlug(val);
      setSlug(newSlug);
    }
    triggerLive(assembleData(val, newSlug));
  };

  const handleAddCustomLink = () => {
    const updated = [
      ...customLinks,
      { id: `c-${Date.now()}`, title: "New Resource", url: "https://", subtitle: "" },
    ];
    setCustomLinks(updated);
    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, twitterVal, updated));
  };

  const handleRemoveCustomLink = (id: string) => {
    const updated = customLinks.filter((c) => c.id !== id);
    setCustomLinks(updated);
    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, twitterVal, updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Employee name is required.");
      return;
    }

    const payload = assembleData();
    setSaving(true);
    try {
      const result = await onSave(payload, initialData?._id);
      if (result && typeof result === "object" && result.success) {
        onClose();
      } else if (result === true) {
        onClose();
      } else {
        const errorText =
          result && typeof result === "object" && result.error
            ? result.error
            : "Failed to save card. Please try again.";
        setErrorMsg(errorText);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-black/[0.08] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-4.5 border-b border-black/[0.06] bg-[#0a192f] text-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {isEditing ? `Edit Reach Card: ${initialData?.name}` : "Create New Reach World NFC Card"}
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Streamlined configuration with automatic link generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-7 bg-[#F8F9FA]">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section: Employee Profile */}
          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">
                1. Employee Identity & Corporate Profile
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Faraj Alseidi"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Card URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-[#64748B] bg-black/[0.03] px-3 py-2.5 border border-r-0 border-black/10 rounded-l-xl font-mono text-[11px]">
                    reachworld.com/
                  </span>
                  <input
                    type="text"
                    placeholder="mohammad-alseidi"
                    value={slug}
                    onChange={(e) => {
                      const s = formatSlug(e.target.value);
                      setSlug(s);
                      triggerLive(assembleData(name, s));
                    }}
                    className="w-full px-3 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium rounded-r-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Job Title / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Managing Director"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    triggerLive(assembleData(name, slug, e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Management, Operations, Sales"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] font-medium rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#FBFBFD]"
                />
              </div>
            </div>
          </div>

          {/* Section: Direct Communication Channels (Clean fixed labels, auto URL generation) */}
          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">
                  2. Official Channels (Automatic Link Generation)
                </span>
                <p className="text-[11px] text-[#64748B]">
                  Titles are permanent. Just enter the number, email, username or link.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Phone Field */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="phone" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Call Direct
                </div>
                <div className="flex-1 flex items-center">
                  <span className="px-3 py-2 bg-black/[0.05] border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#0F172A]">
                    +962
                  </span>
                  <input
                    type="tel"
                    placeholder="7 9764 9615 (9 digits)"
                    value={phoneDigits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPhoneDigits(val);
                      triggerLive(assembleData(name, slug, jobTitle, department, val));
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-r-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              {/* WhatsApp Field */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="whatsapp" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Chat on WhatsApp
                </div>
                <div className="flex-1 flex items-center">
                  <span className="px-3 py-2 bg-black/[0.05] border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#0F172A]">
                    +962
                  </span>
                  <input
                    type="tel"
                    placeholder="7 9764 9615 (auto-creates wa.me link)"
                    value={waDigits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setWaDigits(val);
                      triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, val));
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-r-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="email" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Send Email
                </div>
                <input
                  type="email"
                  placeholder="name@reachworld.com (auto-creates mailto link)"
                  value={emailVal}
                  onChange={(e) => {
                    setEmailVal(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, e.target.value));
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* Official Website */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="website" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Official Website
                </div>
                <input
                  type="text"
                  placeholder="reachworld.com (or paste full link)"
                  value={websiteVal}
                  onChange={(e) => {
                    setWebsiteVal(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, e.target.value));
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* Office / Google Maps */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="maps" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Office Location
                </div>
                <input
                  type="text"
                  placeholder="Paste Google Maps URL or Location pin"
                  value={mapsVal}
                  onChange={(e) => {
                    setMapsVal(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, e.target.value));
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* LinkedIn (Full Link Required) */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="linkedin" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  LinkedIn
                </div>
                <input
                  type="text"
                  placeholder="Paste full profile URL (e.g. https://linkedin.com/in/...)"
                  value={linkedinVal}
                  onChange={(e) => {
                    setLinkedinVal(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, e.target.value));
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* Instagram (Username only) */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="instagram" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Instagram
                </div>
                <div className="flex-1 flex items-center">
                  <span className="px-3 py-2 bg-black/[0.05] border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#64748B]">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="username only (e.g. mohammad_alseidi)"
                    value={instagramVal}
                    onChange={(e) => {
                      setInstagramVal(e.target.value);
                      triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, e.target.value));
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-r-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              {/* Facebook (Username only) */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="facebook" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  Facebook
                </div>
                <input
                  type="text"
                  placeholder="Username or page name"
                  value={facebookVal}
                  onChange={(e) => {
                    setFacebookVal(e.target.value);
                    triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, e.target.value));
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              {/* X / Twitter (Username only) */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f284b] flex items-center justify-center p-2 shrink-0">
                  <SocialIcon type="twitter" className="w-full h-full" />
                </div>
                <div className="w-32 shrink-0 font-bold text-xs text-[#0F172A]">
                  X (Twitter)
                </div>
                <div className="flex-1 flex items-center">
                  <span className="px-3 py-2 bg-black/[0.05] border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#64748B]">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="username only (e.g. m_alseidi)"
                    value={twitterVal}
                    onChange={(e) => {
                      setTwitterVal(e.target.value);
                      triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, e.target.value));
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-r-xl border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Custom Links (User can freely name these) */}
          <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">
                  3. Additional Custom Links ({customLinks.length})
                </span>
                <p className="text-[11px] text-[#64748B]">
                  Optional custom links (e.g. Portfolio, PDF Catalog, Event Form) with custom titles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="px-3 py-1.5 rounded-xl bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Custom Link
              </button>
            </div>

            {customLinks.length === 0 ? (
              <p className="text-xs text-[#94A3B8] italic">
                No additional custom links added. Click the button above if you need extra buttons.
              </p>
            ) : (
              <div className="space-y-3">
                {customLinks.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <input
                      type="text"
                      placeholder="Button Title (e.g. Company Portfolio)"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...customLinks];
                        updated[idx].title = e.target.value;
                        setCustomLinks(updated);
                        triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, twitterVal, updated));
                      }}
                      className="w-1/3 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                    />
                    <input
                      type="text"
                      placeholder="Destination URL (https://...)"
                      value={item.url}
                      onChange={(e) => {
                        const updated = [...customLinks];
                        updated[idx].url = e.target.value;
                        setCustomLinks(updated);
                        triggerLive(assembleData(name, slug, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, twitterVal, updated));
                      }}
                      className="flex-1 px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] rounded-lg border border-black/10 bg-white focus:outline-none focus:border-[#0071E3]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-black/[0.06] bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Deploy Reach Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
