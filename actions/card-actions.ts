"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Card, { ICard, ILink, CardModeType } from "@/models/Card";
import { ensureSeedCards } from "@/lib/mock-data";
import { normalizeRedirectUrl, sanitizeLinkUrl } from "@/lib/url-utils";
import { requireAuth, ensureDefaultAdmin } from "@/lib/auth";

export interface CardListItem {
  _id: string;
  cardNumber: number;
  name: string;
  slug: string;
  jobTitle: string;
  department: string;
  headline?: string;
  location?: string;
  avatarUrl: string;
  themeColor?: string;
  phone?: string;
  email?: string;
  mode: CardModeType;
  redirectUrl?: string;
  isActive: boolean;
  views: number;
  vcardClicks?: number;
  lastTappedAt?: string;
  linksCount: number;
  links?: ILink[];
  updatedAt: string;
}

export interface GetCardsResponse {
  cards: CardListItem[];
  total: number;
  page: number;
  totalPages: number;
  departments: string[];
}

export interface RecentTapActivity {
  cardNumber: number;
  slug: string;
  cardName: string;
  mode: CardModeType;
  redirectUrl?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalCards: number;
  totalActive: number;
  totalTaps: number;
  totalCustomLinks: number;
  totalProfiles: number;
  topPerformer: {
    cardNumber: number;
    name: string;
    jobTitle: string;
    views: number;
    slug: string;
    avatarUrl: string;
    mode: CardModeType;
  } | null;
  tapThroughRate: number;
  recentTaps: RecentTapActivity[];
}

export interface DashboardDataResponse {
  cards: CardListItem[];
  departments: string[];
  analytics: AnalyticsSummary;
}

/**
 * Super-fast unified fetch: 1 single lean query that computes cards and analytics simultaneously.
 */
export async function getDashboardData(): Promise<DashboardDataResponse> {
  try {
    await requireAuth();
    await connectToDatabase();
    await ensureSeedCards();
    await ensureDefaultAdmin();

    const rawCards = await Card.find()
      .select(
        "cardNumber name slug jobTitle department headline location avatarUrl themeColor phone email mode redirectUrl isActive views vcardClicks lastTappedAt links updatedAt"
      )
      .sort({ cardNumber: 1 })
      .lean();

    let totalTaps = 0;
    let totalClicks = 0;
    let totalActive = 0;
    let totalCustomLinks = 0;
    let totalProfiles = 0;
    const deptSet = new Set<string>();

    const cards: CardListItem[] = rawCards.map((doc: any) => {
      const v = Number(doc.views) || 0;
      totalTaps += v;
      if (doc.isActive) totalActive++;
      if (doc.mode === "redirect") totalCustomLinks++;
      else totalProfiles++;

      if (doc.department) deptSet.add(doc.department);

      const links = (doc.links || []).map((l: any) => {
        const c = Number(l.clicks) || 0;
        totalClicks += c;
        return {
          _id: l._id ? l._id.toString() : undefined,
          title: l.title || "",
          subtitle: l.subtitle || "",
          url: l.url || "",
          icon: l.icon || "website",
          isActive: l.isActive !== false,
          clicks: c,
        };
      });

      return {
        _id: doc._id.toString(),
        cardNumber: doc.cardNumber || parseInt(doc.slug, 10) || 1,
        name: doc.name,
        slug: doc.slug,
        jobTitle: doc.jobTitle || "",
        department: doc.department || "Reach World",
        headline: doc.headline || "",
        location: doc.location || "",
        avatarUrl: doc.avatarUrl || "",
        themeColor: doc.themeColor || "#0a192f",
        phone: doc.phone || "",
        email: doc.email || "",
        mode: doc.mode === "redirect" ? "redirect" : "profile",
        redirectUrl: doc.redirectUrl || "",
        isActive: doc.isActive ?? true,
        views: v,
        vcardClicks: Number(doc.vcardClicks) || 0,
        lastTappedAt: doc.lastTappedAt ? new Date(doc.lastTappedAt).toISOString() : undefined,
        linksCount: links.length,
        links,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    const sortedByViews = [...cards].sort((a, b) => b.views - a.views);
    const topDoc = sortedByViews[0] || null;

    const recentTapped = [...cards]
      .filter((c) => c.lastTappedAt)
      .sort((a, b) => new Date(b.lastTappedAt!).getTime() - new Date(a.lastTappedAt!).getTime())
      .slice(0, 8);

    const tapThroughRate =
      totalTaps > 0 ? Math.min(100, Number(((totalClicks / totalTaps) * 100).toFixed(1))) : 0;

    return {
      cards,
      departments: Array.from(deptSet).filter(Boolean),
      analytics: {
        totalCards: cards.length || 50,
        totalActive,
        totalTaps,
        totalCustomLinks,
        totalProfiles,
        topPerformer:
          topDoc && topDoc.views > 0
            ? {
                cardNumber: topDoc.cardNumber,
                name: topDoc.name,
                jobTitle: topDoc.jobTitle,
                views: topDoc.views,
                slug: topDoc.slug,
                avatarUrl: topDoc.avatarUrl,
                mode: topDoc.mode,
              }
            : null,
        tapThroughRate: tapThroughRate || 0,
        recentTaps: recentTapped.map((c) => ({
          cardNumber: c.cardNumber,
          slug: c.slug,
          cardName: c.name,
          mode: c.mode,
          redirectUrl: c.redirectUrl,
          timestamp: c.lastTappedAt!,
        })),
      },
    };
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return {
      cards: [],
      departments: [],
      analytics: {
        totalCards: 50,
        totalActive: 0,
        totalTaps: 0,
        totalCustomLinks: 0,
        totalProfiles: 0,
        topPerformer: null,
        tapThroughRate: 0,
        recentTaps: [],
      },
    };
  }
}

/**
 * Super-fast fetch of cards with indexes and lean query.
 */
export async function getCards({
  page = 1,
  limit = 50,
  search = "",
  department = "all",
  status = "all",
  mode = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  mode?: string;
}): Promise<GetCardsResponse> {
  try {
    await requireAuth();
    await connectToDatabase();
    await ensureSeedCards();
    await ensureDefaultAdmin();

    const query: Record<string, unknown> = {};

    if (search.trim()) {
      const trimmed = search.trim();
      const numMatch = trimmed.replace(/^[#\s]+/, "");
      const isNum = !isNaN(Number(numMatch)) && Number(numMatch) >= 1 && Number(numMatch) <= 50;

      const searchRegex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      if (isNum) {
        query.$or = [
          { cardNumber: Number(numMatch) },
          { slug: numMatch },
          { name: searchRegex },
          { redirectUrl: searchRegex },
        ];
      } else {
        query.$or = [
          { name: searchRegex },
          { jobTitle: searchRegex },
          { department: searchRegex },
          { redirectUrl: searchRegex },
        ];
      }
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "paused") {
      query.isActive = false;
    }

    if (mode === "redirect") {
      query.mode = "redirect";
    } else if (mode === "profile") {
      query.mode = "profile";
    }

    const skip = (page - 1) * limit;

    const [rawCards, total, distinctDepts] = await Promise.all([
      Card.find(query)
        .select(
          "cardNumber name slug jobTitle department headline location avatarUrl themeColor phone email mode redirectUrl isActive views vcardClicks lastTappedAt links updatedAt"
        )
        .sort({ cardNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Card.countDocuments(query),
      Card.distinct("department"),
    ]);

    const cards: CardListItem[] = rawCards.map((doc: any) => ({
      _id: doc._id.toString(),
      cardNumber: doc.cardNumber || parseInt(doc.slug, 10) || 1,
      name: doc.name,
      slug: doc.slug,
      jobTitle: doc.jobTitle || "",
      department: doc.department || "Reach World",
      headline: doc.headline || "",
      location: doc.location || "",
      avatarUrl: doc.avatarUrl || "",
      themeColor: doc.themeColor || "#0a192f",
      phone: doc.phone || "",
      email: doc.email || "",
      mode: doc.mode === "redirect" ? "redirect" : "profile",
      redirectUrl: doc.redirectUrl || "",
      isActive: doc.isActive ?? true,
      views: Number(doc.views) || 0,
      vcardClicks: Number(doc.vcardClicks) || 0,
      lastTappedAt: doc.lastTappedAt ? new Date(doc.lastTappedAt).toISOString() : undefined,
      linksCount: Array.isArray(doc.links) ? doc.links.length : 0,
      links: (doc.links || []).map((l: any) => ({
        _id: l._id ? l._id.toString() : undefined,
        title: l.title || "",
        subtitle: l.subtitle || "",
        url: l.url || "",
        icon: l.icon || "website",
        isActive: l.isActive !== false,
        clicks: Number(l.clicks) || 0,
      })),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return {
      cards,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      departments: (distinctDepts || []).filter(Boolean) as string[],
    };
  } catch (error) {
    console.error("Error in getCards:", error);
    return {
      cards: [],
      total: 0,
      page: 1,
      totalPages: 1,
      departments: [],
    };
  }
}

/**
 * 100% Accurate, lightning-fast in-memory analytics computation across 50 cards.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    await requireAuth();
    await connectToDatabase();
    await ensureSeedCards();

    // Fetch all 50 cards in one single rapid query
    const allCards = await Card.find()
      .select("cardNumber name jobTitle views lastTappedAt mode redirectUrl links avatarUrl isActive")
      .lean();

    let totalTaps = 0;
    let totalClicks = 0;
    let totalActive = 0;
    let totalCustomLinks = 0;
    let totalProfiles = 0;

    for (const c of allCards as any[]) {
      const v = Number(c.views) || 0;
      totalTaps += v;

      if (c.isActive) totalActive++;
      if (c.mode === "redirect") totalCustomLinks++;
      else totalProfiles++;

      if (Array.isArray(c.links)) {
        for (const l of c.links) {
          totalClicks += Number(l.clicks) || 0;
        }
      }
    }

    // Sort by views to get top performer
    const sortedByViews = [...allCards].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    const topPerformerDoc: any = sortedByViews[0] || null;

    // Filter cards with lastTappedAt to get live recent activity
    const recentTappedDocs: any[] = [...allCards]
      .filter((c: any) => c.lastTappedAt)
      .sort((a: any, b: any) => new Date(b.lastTappedAt).getTime() - new Date(a.lastTappedAt).getTime())
      .slice(0, 8);

    const tapThroughRate =
      totalTaps > 0 ? Math.min(100, Number(((totalClicks / totalTaps) * 100).toFixed(1))) : 0;

    const recentTaps: RecentTapActivity[] = recentTappedDocs.map((c: any) => ({
      cardNumber: c.cardNumber || parseInt(c.slug, 10) || 1,
      slug: c.slug,
      cardName: c.name,
      mode: c.mode || "profile",
      redirectUrl: c.redirectUrl || "",
      timestamp: new Date(c.lastTappedAt).toISOString(),
    }));

    return {
      totalCards: allCards.length || 50,
      totalActive,
      totalTaps,
      totalCustomLinks,
      totalProfiles,
      topPerformer: topPerformerDoc && topPerformerDoc.views > 0
        ? {
            cardNumber: topPerformerDoc.cardNumber || 1,
            name: topPerformerDoc.name,
            jobTitle: topPerformerDoc.jobTitle || "",
            views: topPerformerDoc.views || 0,
            slug: topPerformerDoc.slug,
            avatarUrl: topPerformerDoc.avatarUrl || "",
            mode: topPerformerDoc.mode || "profile",
          }
        : null,
      tapThroughRate: tapThroughRate || 0,
      recentTaps,
    };
  } catch (error) {
    console.error("Error in getAnalyticsSummary:", error);
    return {
      totalCards: 50,
      totalActive: 0,
      totalTaps: 0,
      totalCustomLinks: 0,
      totalProfiles: 0,
      topPerformer: null,
      tapThroughRate: 0,
      recentTaps: [],
    };
  }
}

/**
 * Toggle card active status instantly.
 */
export async function toggleCardStatus(cardId: string, isActive: boolean) {
  try {
    await requireAuth();
    await connectToDatabase();
    const updated = await Card.findByIdAndUpdate(
      cardId,
      { $set: { isActive } },
      { new: true }
    ).select("slug cardNumber");

    revalidatePath("/dashboard");
    if (updated?.slug) {
      revalidatePath(`/${updated.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling card status:", error);
    return { success: false, error: error.message };
  }
}

export interface CardFormData {
  name: string;
  cardNumber?: number;
  slug?: string;
  jobTitle?: string;
  department?: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  themeColor?: string;
  phone?: string;
  email?: string;
  mode?: CardModeType;
  redirectUrl?: string;
  isActive?: boolean;
  links?: ILink[];
}

/**
 * Update card details (including optional custom/secure unguessable URL slug).
 */
export async function updateCard(cardId: string, data: CardFormData) {
  try {
    await requireAuth();
    await connectToDatabase();

    const existing = await Card.findById(cardId);
    if (!existing) {
      return { success: false, error: "Card not found" };
    }

    const oldSlug = existing.slug;

    // Optional URL slug customization (prevents sequential enumeration /1, /2, /3)
    if (data.slug) {
      const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
      if (cleanSlug && cleanSlug !== existing.slug) {
        const reserved = ["dashboard", "login", "api", "admin", "icon", "favicon", "og-image", "apple-touch-icon"];
        if (reserved.includes(cleanSlug)) {
          return { success: false, error: `The URL handle /${cleanSlug} is reserved by the system.` };
        }
        const conflict = await Card.findOne({ slug: cleanSlug, _id: { $ne: existing._id } });
        if (conflict) {
          return {
            success: false,
            error: `The URL /${cleanSlug} is already used by Slot #${conflict.cardNumber}. Please choose another handle.`,
          };
        }
        existing.slug = cleanSlug;
      }
    }

    const cleanUrl = normalizeRedirectUrl(data.redirectUrl);

    existing.name = (data.name || "").trim().slice(0, 100) || `Card #${existing.cardNumber < 10 ? '0' + existing.cardNumber : existing.cardNumber}`;
    existing.jobTitle = (data.jobTitle || "").trim().slice(0, 100);
    existing.department = (data.department || "").trim().slice(0, 80) || "Reach World";
    existing.headline = (data.headline || "").trim().slice(0, 200);
    existing.location = (data.location || "").trim().slice(0, 100) || "Amman, Jordan";
    existing.avatarUrl = (data.avatarUrl || "").trim().slice(0, 500);
    existing.themeColor = (data.themeColor || "#0a192f").slice(0, 30);
    existing.phone = (data.phone || "").trim().slice(0, 50);
    existing.email = (data.email || "").trim().slice(0, 100);
    existing.mode = data.mode === "redirect" ? "redirect" : "profile";
    existing.redirectUrl = cleanUrl;

    if (typeof data.isActive === "boolean") {
      existing.isActive = data.isActive;
    }

    if (data.links && Array.isArray(data.links)) {
      const existingLinks = existing.links || [];
      existing.links = data.links.slice(0, 30).map((nl: any) => {
        const found = existingLinks.find(
          (ex: any) => (nl._id && ex._id?.toString() === nl._id) || ex.icon === nl.icon
        );
        return {
          ...nl,
          title: (nl.title || "").trim().slice(0, 80),
          subtitle: (nl.subtitle || "").trim().slice(0, 100),
          url: sanitizeLinkUrl(nl.url || "", nl.icon),
          clicks: found ? (found.clicks || 0) : (nl.clicks || 0),
        };
      }) as any;
    }

    await existing.save();

    revalidatePath("/dashboard");
    revalidatePath(`/${existing.slug}`);
    if (oldSlug && oldSlug !== existing.slug) {
      revalidatePath(`/${oldSlug}`);
    }

    return { success: true, cardId: existing._id.toString(), slug: existing.slug };
  } catch (error: any) {
    console.error("Error updating card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update card destination link.
 */
export async function updateCardDestination(
  cardId: string,
  mode: CardModeType,
  redirectUrl: string
) {
  try {
    await requireAuth();
    await connectToDatabase();

    const cleanUrl = normalizeRedirectUrl(redirectUrl);

    const updated = await Card.findByIdAndUpdate(
      cardId,
      {
        $set: {
          mode,
          redirectUrl: cleanUrl,
        },
      },
      { new: true }
    ).select("slug cardNumber");

    if (!updated) {
      return { success: false, error: "Card slot not found." };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/${updated.slug}`);

    return { success: true };
  } catch (err: any) {
    console.error("Error updating card destination:", err);
    return { success: false, error: err.message };
  }
}

export async function createCard(_data: CardFormData) {
  return {
    success: false,
    error: "Reach World system is locked to 50 fixed NFC cards (Cards #1 to #50).",
  };
}

export async function deleteCard(_cardId: string) {
  return {
    success: false,
    error: "Fixed physical NFC cards (1 to 50) cannot be deleted.",
  };
}

/**
 * Reset a card slot to clean default without deleting the slot.
 */
export async function resetCard(cardId: string) {
  try {
    await requireAuth();
    await connectToDatabase();

    const card = await Card.findById(cardId);
    if (!card) {
      return { success: false, error: "Card slot not found" };
    }

    const padded = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;

    card.name = `Card #${padded}`;
    card.jobTitle = "Team Member";
    card.department = "Reach World";
    card.headline = "Reach World NFC Smart Card";
    card.location = "Amman, Jordan";
    card.avatarUrl = "";
    card.themeColor = "#0a192f";
    card.phone = "";
    card.email = "";
    card.mode = "profile";
    card.redirectUrl = "";
    card.isActive = true;
    card.links = [] as any;

    await card.save();

    revalidatePath("/dashboard");
    revalidatePath(`/${card.slug}`);

    return { success: true };
  } catch (err: any) {
    console.error("Error resetting card:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Zero-out all views, scans, and link clicks across all 50 cards for client handover.
 */
export async function resetAllAnalyticsAction() {
  try {
    await requireAuth();
    await connectToDatabase();

    await Card.updateMany({}, {
      $set: {
        views: 0,
        vcardClicks: 0,
        lastTappedAt: null,
      },
    });

    const allCards = await Card.find().select("_id links").lean();
    for (const card of allCards as any[]) {
      if (Array.isArray(card.links) && card.links.length > 0) {
        const resetLinks = card.links.map((l: any) => ({ ...l, clicks: 0 }));
        await Card.updateOne({ _id: card._id }, { $set: { links: resetLinks } });
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error resetting all analytics:", error);
    return { success: false, error: error.message };
  }
}

export async function getCardById(cardId: string) {
  try {
    await connectToDatabase();
    const doc = await Card.findById(cardId).lean();
    if (!doc) return null;
    return {
      ...doc,
      _id: (doc as any)._id.toString(),
      createdAt: (doc as any).createdAt?.toISOString(),
      updatedAt: (doc as any).updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error("Error in getCardById:", error);
    return null;
  }
}

/**
 * Fetch card by slug (Strict slug routing to prevent sequential enumeration /1, /2, /3).
 */
export async function getCardBySlug(slug: string) {
  try {
    await connectToDatabase();

    const cleanSlug = (slug || "").trim().toLowerCase();

    // Strict slug match: prevents guessing other employee cards by changing URL numbers
    let doc = await Card.findOne({ slug: cleanSlug }).lean();

    // Fallback for default slots that haven't been assigned a secure custom handle yet
    if (!doc) {
      const num = parseInt(cleanSlug, 10);
      if (!isNaN(num)) {
        doc = await Card.findOne({ cardNumber: num, slug: String(num) }).lean();
      }
    }

    if (!doc) return null;

    return {
      ...doc,
      _id: (doc as any)._id.toString(),
      createdAt: (doc as any).createdAt?.toISOString(),
      updatedAt: (doc as any).updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error("Error in getCardBySlug:", error);
    return null;
  }
}

/**
 * Accurately records an NFC tap in real-time, filtering crawler preview bots.
 * Only increments the view counter and updates lastTappedAt without saving any user device data or logs.
 */
export async function recordCardTap(cardId: string, userAgent?: string) {
  try {
    const ua = (userAgent || "").toLowerCase();

    // Ignore social bot crawlers generating link previews
    const isBot =
      ua.includes("bot") ||
      ua.includes("spider") ||
      ua.includes("crawl") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("whatsapp") ||
      ua.includes("twitterbot") ||
      ua.includes("linkedinbot") ||
      ua.includes("telegrambot") ||
      ua.includes("slackbot");

    if (isBot) return;

    await connectToDatabase();

    await Card.findByIdAndUpdate(cardId, {
      $inc: { views: 1 },
      $set: { lastTappedAt: new Date() },
    });
  } catch (err) {
    console.error("Error recording card tap:", err);
  }
}

/**
 * Export all 50 cards with clean, client-safe wording.
 */
export async function exportCardsToCSV(): Promise<string> {
  try {
    await requireAuth();
    await connectToDatabase();
    await ensureSeedCards();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://reachworld.com";
    const cards = await Card.find()
      .select("cardNumber slug name jobTitle department mode redirectUrl phone email isActive views lastTappedAt")
      .sort({ cardNumber: 1 })
      .lean();

    const headers = [
      "Card Number",
      "Path (Slug)",
      "Card URL",
      "Link Type",
      "Assigned Website / Link",
      "Employee Name",
      "Job Title",
      "Department",
      "Phone",
      "Email",
      "Status",
      "Total Taps",
      "Last Tapped At",
    ];

    const escape = (val: any) => `"${(String(val || "")).replace(/"/g, '""')}"`;

    const rows = cards.map((c: any) => {
      const nfcUrl = `${baseUrl}/${c.slug}`;
      const status = c.isActive ? "Active" : "Paused";
      const linkType = c.mode === "redirect" ? "Custom Link" : "Digital Profile";
      const lastTapped = c.lastTappedAt ? new Date(c.lastTappedAt).toLocaleString() : "Never";

      return [
        escape(c.cardNumber),
        escape(c.slug),
        escape(nfcUrl),
        escape(linkType),
        escape(c.redirectUrl || ""),
        escape(c.name),
        escape(c.jobTitle),
        escape(c.department),
        escape(c.phone || ""),
        escape(c.email || ""),
        escape(status),
        escape(c.views || 0),
        escape(lastTapped),
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\r\n");
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return "";
  }
}

/**
 * Batch update cards from CSV.
 */
export async function importCardsFromCSV(records: Array<{
  cardNumber?: number | string;
  name?: string;
  jobTitle?: string;
  department?: string;
  email?: string;
  phone?: string;
  mode?: string;
  redirectUrl?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}>) {
  try {
    await connectToDatabase();
    await ensureSeedCards();

    let updatedCount = 0;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const slotNum = r.cardNumber ? parseInt(String(r.cardNumber), 10) : i + 1;

      if (isNaN(slotNum) || slotNum < 1 || slotNum > 50) continue;

      const card = await Card.findOne({ cardNumber: slotNum });
      if (!card) continue;

      if (r.name && r.name.trim()) card.name = r.name.trim();
      if (r.jobTitle) card.jobTitle = r.jobTitle.trim();
      if (r.department) card.department = r.department.trim();
      if (r.email) card.email = r.email.trim();
      if (r.phone) card.phone = r.phone.trim();
      if (r.location) card.location = r.location.trim();

      if (r.mode) {
        const m = r.mode.toLowerCase();
        card.mode = m.includes("custom") || m.includes("link") || m.includes("redirect") ? "redirect" : "profile";
      }

      if (r.redirectUrl) {
        card.redirectUrl = normalizeRedirectUrl(r.redirectUrl);
      }

      await card.save();
      updatedCount++;
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      count: updatedCount,
    };
  } catch (error: any) {
    console.error("Error importing cards:", error);
    return { success: false, error: error.message };
  }
}
