"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  UserCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { CardFormData } from "@/actions/card-actions";
import { CardModeType } from "@/models/Card";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { normalizeRedirectUrl } from "@/lib/url-utils";

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (CardFormData & { _id?: string; cardNumber?: number; slug?: string }) | null;
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
  const cardNumber = initialData?.cardNumber || (initialData?.slug ? parseInt(initialData.slug, 10) : 1);
  const cardSlug = initialData?.slug || String(cardNumber);
  const paddedSlot = cardNumber < 10 ? `0${cardNumber}` : `${cardNumber}`;

  // Routing Mode: profile vs redirect
  const [mode, setMode] = useState<CardModeType>(initialData?.mode || "profile");
  const [redirectUrl, setRedirectUrl] = useState(initialData?.redirectUrl || "");

  // Identity state
  const [name, setName] = useState(initialData?.name || `Card #${paddedSlot}`);
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "");
  const [department, setDepartment] = useState(initialData?.department || "Reach World");

  // Fixed Channels values
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

  const [waDigits, setWaDigits] = useState(() => getInitialVal("whatsapp") || "");
  const [emailVal, setEmailVal] = useState(() => initialData?.email || getInitialVal("email") || "");
  const [websiteVal, setWebsiteVal] = useState(() => getInitialVal("website") || "");
  const [mapsVal, setMapsVal] = useState(() => getInitialVal("maps") || "");
  const [linkedinVal, setLinkedinVal] = useState(() => getInitialVal("linkedin") || "");
  const [instagramVal, setInstagramVal] = useState(() => getInitialVal("instagram") || "");
  const [facebookVal, setFacebookVal] = useState(() => getInitialVal("facebook") || "");
  const [twitterVal, setTwitterVal] = useState(() => getInitialVal("twitter") || "");

  // Custom links
  const [customLinks, setCustomLinks] = useState<CustomLinkItem[]>(() => {
    return (initialData?.links || [])
      .filter((l) => l.icon === "custom")
      .map((l, i) => ({
        id: `custom-${i}`,
        title: l.title || "",
        url: l.url || "",
        subtitle: l.subtitle || "",
      }));
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Keep state synced when initialData changes
  useEffect(() => {
    if (initialData) {
      setMode(initialData.mode || (initialData.redirectUrl ? "redirect" : "profile"));
      setRedirectUrl(initialData.redirectUrl || "");
      setName(initialData.name || `Card #${paddedSlot}`);
      setJobTitle(initialData.jobTitle || "");
      setDepartment(initialData.department || "Reach World");

      const fromRoot = (initialData.phone || "").replace(/^\+?962/, "").replace(/^0/, "");
      setPhoneDigits(fromRoot || getInitialVal("phone") || "");
      setWaDigits(getInitialVal("whatsapp") || "");
      setEmailVal(initialData.email || getInitialVal("email") || "");
      setWebsiteVal(getInitialVal("website") || "");
      setMapsVal(getInitialVal("maps") || "");
      setLinkedinVal(getInitialVal("linkedin") || "");
      setInstagramVal(getInitialVal("instagram") || "");
      setFacebookVal(getInitialVal("facebook") || "");
      setTwitterVal(getInitialVal("twitter") || "");
    }
  }, [initialData, paddedSlot]);

  if (!isOpen) return null;

  // Build links array
  const assembleData = (
    currentMode = mode,
    currentRedirect = redirectUrl,
    currentName = name,
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
    const getExistingClicks = (icon: string) => {
      const match = (initialData?.links || []).find((l: any) => l.icon === icon);
      return match?.clicks || 0;
    };

    // 1. Phone
    const cleanPhone = curPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone ? `+962${cleanPhone}` : "";
    if (cleanPhone) {
      links.push({
        title: "Call Direct",
        subtitle: formattedPhone,
        url: `tel:${formattedPhone}`,
        icon: "phone",
        isActive: true,
        clicks: getExistingClicks("phone"),
      });
    }

    // 2. WhatsApp
    const cleanWa = curWa.replace(/\D/g, "");
    if (cleanWa) {
      links.push({
        title: "Chat on WhatsApp",
        subtitle: "Quick Response",
        url: `https://wa.me/962${cleanWa}`,
        icon: "whatsapp",
        isActive: true,
        clicks: getExistingClicks("whatsapp"),
      });
    }

    // 3. Email
    if (curEmail.trim()) {
      links.push({
        title: "Send Email",
        subtitle: curEmail.trim(),
        url: `mailto:${curEmail.trim()}`,
        icon: "email",
        isActive: true,
        clicks: getExistingClicks("email"),
      });
    }

    // 4. Website
    if (curWeb.trim()) {
      const fullUrl = curWeb.startsWith("http") ? curWeb.trim() : `https://${curWeb.trim()}`;
      links.push({
        title: "Official Website",
        subtitle: curWeb.replace(/^https?:\/\//, ""),
        url: fullUrl,
        icon: "website",
        isActive: true,
        clicks: getExistingClicks("website"),
      });
    }

    // 5. Google Maps
    if (curMaps.trim()) {
      links.push({
        title: "Headquarters & Office",
        subtitle: "Amman, Jordan",
        url: curMaps.trim(),
        icon: "maps",
        isActive: true,
        clicks: getExistingClicks("maps"),
      });
    }

    // 6. LinkedIn
    if (curLk.trim()) {
      const fullLk = curLk.startsWith("http") ? curLk.trim() : `https://${curLk.trim()}`;
      links.push({
        title: "LinkedIn",
        subtitle: "Professional Profile",
        url: fullLk,
        icon: "linkedin",
        isActive: true,
        clicks: getExistingClicks("linkedin"),
      });
    }

    // 7. Instagram
    const cleanIg = curIg.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
    if (cleanIg) {
      links.push({
        title: "Instagram",
        subtitle: `@${cleanIg}`,
        url: `https://instagram.com/${cleanIg}`,
        icon: "instagram",
        isActive: true,
        clicks: getExistingClicks("instagram"),
      });
    }

    // 8. Facebook
    const cleanFb = curFb.trim();
    if (cleanFb) {
      const fullFb = cleanFb.startsWith("http") ? cleanFb : `https://facebook.com/${cleanFb.replace(/^@/, "")}`;
      links.push({
        title: "Facebook",
        subtitle: "Facebook Page",
        url: fullFb,
        icon: "facebook",
        isActive: true,
        clicks: getExistingClicks("facebook"),
      });
    }

    // 9. X (Twitter)
    const cleanTw = curTw.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "");
    if (cleanTw) {
      links.push({
        title: "X",
        subtitle: `@${cleanTw}`,
        url: `https://x.com/${cleanTw}`,
        icon: "twitter",
        isActive: true,
        clicks: getExistingClicks("twitter"),
      });
    }

    // 10. Custom added links
    curCustoms.forEach((c) => {
      if (c.title.trim() && c.url.trim()) {
        const fullUrl = c.url.startsWith("http") ? c.url.trim() : `https://${c.url.trim()}`;
        const matchCust = (initialData?.links || []).find((l: any) => l._id === c.id || l.url === fullUrl);
        links.push({
          title: c.title.trim(),
          subtitle: c.subtitle?.trim() || fullUrl.replace(/^https?:\/\//, ""),
          url: fullUrl,
          icon: "custom",
          isActive: true,
          clicks: matchCust?.clicks || 0,
        });
      }
    });

    return {
      name: currentName.trim() || `Card #${paddedSlot}`,
      cardNumber,
      jobTitle: currentJob.trim(),
      department: currentDept.trim(),
      phone: formattedPhone,
      email: curEmail.trim(),
      mode: currentMode,
      redirectUrl: normalizeRedirectUrl(currentRedirect),
      links,
    };
  };

  const triggerLive = (data: CardFormData) => {
    if (onLiveChange) {
      onLiveChange(data);
    }
  };

  const handleModeChange = (newMode: CardModeType) => {
    setMode(newMode);
    triggerLive(assembleData(newMode));
  };

  const handleRedirectUrlChange = (val: string) => {
    setRedirectUrl(val);
    triggerLive(assembleData(mode, val));
  };

  const handleApplyPreset = (url: string) => {
    setRedirectUrl(url);
    triggerLive(assembleData(mode, url));
  };

  const handleAddCustomLink = () => {
    const updated = [
      ...customLinks,
      { id: `c-${Date.now()}`, title: "", url: "", subtitle: "" },
    ];
    setCustomLinks(updated);
  };

  const handleRemoveCustomLink = (id: string) => {
    const updated = customLinks.filter((c) => c.id !== id);
    setCustomLinks(updated);
    triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, twitterVal, updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = assembleData();

    if (payload.mode === "redirect" && !payload.redirectUrl) {
      setErrorMsg("Please enter the web link for this card.");
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-[#061528]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-black/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Apple Style Sleek Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0a192f] text-white flex flex-col items-center justify-center font-mono font-bold shadow-xs">
              <span className="text-[9px] text-amber-400">#</span>
              <span className="text-xs leading-none">{paddedSlot}</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Configure Card #{paddedSlot}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium flex items-center gap-2">
                <span>Hardware URL:</span>
                <span className="font-mono text-[#0071E3] font-bold">reachworld.com/{cardSlug}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-white">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* DESTINATION ROUTING MODE SWITCHER */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Card Destination Mode
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F5F5F7] rounded-2xl border border-black/[0.05]">
              <button
                type="button"
                onClick={() => handleModeChange("profile")}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "profile"
                    ? "bg-white text-[#0F172A] shadow-md border border-black/[0.06]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Digital Bio Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("redirect")}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "redirect"
                    ? "bg-[#0071E3] text-white shadow-md"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Custom Web Link</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] px-1 font-medium">
              {mode === "redirect"
                ? `When someone taps physical Card #${paddedSlot}, it will immediately open your assigned web link.`
                : `Displays the complete Reach World digital employee business card.`}
            </p>
          </div>

          {/* IF CUSTOM WEB LINK MODE */}
          {mode === "redirect" ? (
            <div className="space-y-5 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center justify-between">
                  <span>Assigned Web Link <span className="text-red-500">*</span></span>
                  {redirectUrl && (
                    <a
                      href={normalizeRedirectUrl(redirectUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0071E3] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Link Live
                    </a>
                  )}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    required
                    placeholder="https://instagram.com/mybrand or https://example.com"
                    value={redirectUrl}
                    onChange={(e) => handleRedirectUrlChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1.5">
                  Protocols like <span className="font-mono">https://</span> are auto-formatted. Works instantly on all phones.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Quick Destination Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("https://instagram.com/")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] transition-colors cursor-pointer"
                  >
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("https://wa.me/962")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] transition-colors cursor-pointer"
                  >
                    WhatsApp (+962)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("https://reachworld.com")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] transition-colors cursor-pointer"
                  >
                    Reach World Website
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("https://linkedin.com/in/")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] transition-colors cursor-pointer"
                  >
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("https://maps.google.com")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#1D1D1F] hover:border-[#0071E3] transition-colors cursor-pointer"
                  >
                    Google Maps / Reviews
                  </button>
                </div>
              </div>

              {/* Label identifier */}
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1.5">
                  Card Reference Label / Assignee
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    triggerLive(assembleData(mode, redirectUrl, e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-white"
                />
              </div>
            </div>
          ) : (
            /* IF DIGITAL BIO CARD PROFILE MODE */
            <>
              {/* Section: Employee Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Employee Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Physical NFC Path (Slot)
                    </label>
                    <div className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-bold font-mono rounded-xl border border-black/10 bg-[#F1F5F9] text-[#64748B]">
                      reachworld.com/{cardSlug} (Fixed Slot #{paddedSlot})
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => {
                        setJobTitle(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/[0.08]" />

              {/* Section: Channels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Communication Channels
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="phone" className="w-full h-full" />
                      </div>
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-[#1D1D1F] font-bold bg-[#E2E8F0] px-3 py-2.5 border border-r-0 border-black/15 rounded-l-xl font-mono">
                        +962
                      </span>
                      <input
                        type="text"
                        maxLength={9}
                        value={phoneDigits}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setPhoneDigits(v);
                          triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, v));
                        }}
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="whatsapp" className="w-full h-full" />
                      </div>
                      WhatsApp
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-[#1D1D1F] font-bold bg-[#E2E8F0] px-3 py-2.5 border border-r-0 border-black/15 rounded-l-xl font-mono">
                        +962
                      </span>
                      <input
                        type="text"
                        maxLength={9}
                        value={waDigits}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setWaDigits(v);
                          triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, v));
                        }}
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="email" className="w-full h-full" />
                      </div>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailVal}
                      onChange={(e) => {
                        setEmailVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, e.target.value));
                      }}
                      className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="website" className="w-full h-full" />
                      </div>
                      Website
                    </label>
                    <input
                      type="text"
                      value={websiteVal}
                      onChange={(e) => {
                        setWebsiteVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, e.target.value));
                      }}
                      className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  {/* Google Maps */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="maps" className="w-full h-full" />
                      </div>
                      Google Maps Link
                    </label>
                    <input
                      type="text"
                      value={mapsVal}
                      onChange={(e) => {
                        setMapsVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, e.target.value));
                      }}
                      className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="linkedin" className="w-full h-full" />
                      </div>
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={linkedinVal}
                      onChange={(e) => {
                        setLinkedinVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, e.target.value));
                      }}
                      className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="instagram" className="w-full h-full" />
                      </div>
                      Instagram Username
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-[#1D1D1F] font-bold bg-[#E2E8F0] px-3 py-2.5 border border-r-0 border-black/15 rounded-l-xl font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        value={instagramVal}
                        onChange={(e) => {
                          const v = e.target.value.replace(/^@/, "");
                          setInstagramVal(v);
                          triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, v));
                        }}
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="facebook" className="w-full h-full" />
                      </div>
                      Facebook Username / Page
                    </label>
                    <input
                      type="text"
                      value={facebookVal}
                      onChange={(e) => {
                        setFacebookVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, e.target.value));
                      }}
                      className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  {/* X (Twitter) */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0a192f] p-0.5 flex items-center justify-center">
                        <SocialIcon type="twitter" className="w-full h-full" />
                      </div>
                      X Username
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-[#1D1D1F] font-bold bg-[#E2E8F0] px-3 py-2.5 border border-r-0 border-black/15 rounded-l-xl font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        value={twitterVal}
                        onChange={(e) => {
                          const v = e.target.value.replace(/^@/, "");
                          setTwitterVal(v);
                          triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, facebookVal, v));
                        }}
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-black/15 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all bg-[#F8FAFC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Links Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Custom Action Buttons
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="text-xs text-[#0071E3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Custom Button</span>
                  </button>
                </div>

                {customLinks.map((cl, i) => (
                  <div
                    key={cl.id}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-black/10 flex items-center gap-3"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Button Title (e.g. Portfolio)"
                        value={cl.title}
                        onChange={(e) => {
                          const u = [...customLinks];
                          u[i].title = e.target.value;
                          setCustomLinks(u);
                        }}
                        className="px-3 py-2 text-xs rounded-xl border border-black/15 bg-white font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Target URL (e.g. https://...)"
                        value={cl.url}
                        onChange={(e) => {
                          const u = [...customLinks];
                          u[i].url = e.target.value;
                          setCustomLinks(u);
                        }}
                        className="px-3 py-2 text-xs rounded-xl border border-black/15 bg-white font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(cl.id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              Slot #{paddedSlot} • Slug: /{cardSlug}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0071E3] hover:bg-[#0077ED] transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {saving ? "Saving Changes..." : "Save Card"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
