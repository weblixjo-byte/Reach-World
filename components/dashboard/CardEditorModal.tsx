"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  UserCheck,
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
  const paddedSlot = cardNumber < 10 ? `0${cardNumber}` : `${cardNumber}`;

  // Mode: profile vs redirect
  const [mode, setMode] = useState<CardModeType>(initialData?.mode || "profile");
  const [redirectUrl, setRedirectUrl] = useState(initialData?.redirectUrl || "");

  // Automatic secure slug
  const [slugVal, setSlugVal] = useState(() => {
    const raw = initialData?.slug;
    if (raw && !/^\d+$/.test(raw)) return raw;
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let token = "";
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `rw-${paddedSlot}-${token}`;
  });

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

  // Dynamic custom links
  const [customLinks, setCustomLinks] = useState<CustomLinkItem[]>(() => {
    const fixedIcons = ["phone", "whatsapp", "email", "website", "maps", "linkedin", "instagram", "facebook", "twitter"];
    return (initialData?.links || [])
      .filter((l: any) => !fixedIcons.includes(l.icon))
      .map((l: any, i: number) => ({
        id: l._id || `c-${i}`,
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

      const raw = initialData.slug;
      if (raw && !/^\d+$/.test(raw)) {
        setSlugVal(raw);
      } else {
        const chars = "abcdefghjkmnpqrstuvwxyz23456789";
        let token = "";
        for (let i = 0; i < 4; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setSlugVal(`rw-${paddedSlot}-${token}`);
      }

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
    let formattedPhone = "";
    if (cleanPhone) {
      formattedPhone = `+962${cleanPhone}`;
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
      slug: slugVal,
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
    <div className="fixed inset-0 z-50 bg-[#020b18]/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A192F] text-white flex flex-col items-center justify-center font-mono font-bold shadow-xs">
              <span className="text-xs leading-none">{paddedSlot}</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Card #{paddedSlot}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                reachworld.com/{slugVal}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-white">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* DESTINATION ROUTING MODE SWITCHER */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Destination Mode
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleModeChange("profile")}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "profile"
                    ? "bg-white text-[#0F172A] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#0A192F]" />
                <span>Digital Bio Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("redirect")}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "redirect"
                    ? "bg-[#0A192F] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Custom Web Link</span>
              </button>
            </div>
          </div>

          {/* IF CUSTOM WEB LINK MODE */}
          {mode === "redirect" ? (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center justify-between">
                  <span>Destination URL</span>
                  {redirectUrl && (
                    <a
                      href={normalizeRedirectUrl(redirectUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A192F] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Link
                    </a>
                  )}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="https://example.com"
                    value={redirectUrl}
                    onChange={(e) => handleRedirectUrlChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Reference Label / Assignee
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    triggerLive(assembleData(mode, redirectUrl, e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-white"
                />
              </div>
            </div>
          ) : (
            /* IF DIGITAL BIO CARD PROFILE MODE */
            <>
              {/* Section: Employee Information */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Employee Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => {
                        setJobTitle(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Section: Channels */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Channels
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="phone" className="w-full h-full text-white" />
                      </div>
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-700 font-bold bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-200 rounded-l-xl font-mono">
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
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="whatsapp" className="w-full h-full text-white" />
                      </div>
                      WhatsApp
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-700 font-bold bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-200 rounded-l-xl font-mono">
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
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="email" className="w-full h-full text-white" />
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
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="website" className="w-full h-full text-white" />
                      </div>
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={websiteVal}
                      onChange={(e) => {
                        setWebsiteVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50 font-mono"
                    />
                  </div>

                  {/* Google Maps */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="maps" className="w-full h-full text-white" />
                      </div>
                      Location / Maps URL
                    </label>
                    <input
                      type="text"
                      value={mapsVal}
                      onChange={(e) => {
                        setMapsVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50 font-mono"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="linkedin" className="w-full h-full text-white" />
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
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50 font-mono"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="instagram" className="w-full h-full text-white" />
                      </div>
                      Instagram Handle
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-600 bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-200 rounded-l-xl font-mono">
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
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="facebook" className="w-full h-full text-white" />
                      </div>
                      Facebook Profile
                    </label>
                    <input
                      type="text"
                      value={facebookVal}
                      onChange={(e) => {
                        setFacebookVal(e.target.value);
                        triggerLive(assembleData(mode, redirectUrl, name, jobTitle, department, phoneDigits, waDigits, emailVal, websiteVal, mapsVal, linkedinVal, instagramVal, e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#0A192F] p-0.5 flex items-center justify-center">
                        <SocialIcon type="twitter" className="w-full h-full text-white" />
                      </div>
                      X / Twitter
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-600 bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-200 rounded-l-xl font-mono">
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
                        className="w-full px-3 py-2.5 text-xs text-[#0F172A] font-semibold rounded-r-xl border border-slate-200 focus:outline-none focus:border-slate-800 transition-all bg-slate-50"
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
                    className="text-xs text-[#0A192F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Button</span>
                  </button>
                </div>

                {customLinks.map((cl, i) => (
                  <div
                    key={cl.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={cl.title}
                        onChange={(e) => {
                          const u = [...customLinks];
                          u[i].title = e.target.value;
                          setCustomLinks(u);
                        }}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="https://..."
                        value={cl.url}
                        onChange={(e) => {
                          const u = [...customLinks];
                          u[i].url = e.target.value;
                          setCustomLinks(u);
                        }}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(cl.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Slot #{paddedSlot}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#071324] transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
