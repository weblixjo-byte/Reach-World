"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Card, { ICard, ILink, CardModeType } from "@/models/Card";
import { ensureSeedCards } from "@/lib/mock-data";
import { normalizeRedirectUrl } from "@/lib/url-utils";

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
  totalRedirects: number;
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

/**
 * Fetch the fixed 50 cards (or paginated) with search and filters.
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
    await connectToDatabase();
    await ensureSeedCards();

    const query: Record<string, unknown> = {};

    // Search query: support number "7", "#07", name, department, redirectUrl
    if (search.trim()) {
      const trimmedSearch = search.trim();
      const numMatch = trimmedSearch.replace(/^[#\s]+/, "");
      const isNum = !isNaN(Number(numMatch)) && Number(numMatch) >= 1 && Number(numMatch) <= 50;

      const searchRegex = new RegExp(trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

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
          "cardNumber name slug jobTitle department headline location avatarUrl themeColor phone email mode redirectUrl isActive views lastTappedAt links updatedAt"
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
      views: doc.views || 0,
      lastTappedAt: doc.lastTappedAt ? new Date(doc.lastTappedAt).toISOString() : undefined,
      linksCount: Array.isArray(doc.links) ? doc.links.length : 0,
      links: doc.links || [],
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
 * Computes deep analytics: total taps, active cards, redirects vs profiles, top performers.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    await connectToDatabase();
    await ensureSeedCards();

    const [
      totalCards,
      totalActive,
      totalRedirects,
      totalProfiles,
      topPerformerDoc,
      aggregateResult,
      recentTappedDocs,
    ] = await Promise.all([
      Card.countDocuments(),
      Card.countDocuments({ isActive: true }),
      Card.countDocuments({ mode: "redirect" }),
      Card.countDocuments({ mode: "profile" }),
      Card.findOne({ isActive: true })
        .sort({ views: -1, lastTappedAt: -1 })
        .select("cardNumber name jobTitle views slug avatarUrl mode")
        .lean(),
      Card.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalLinkClicks: { $sum: { $sum: "$links.clicks" } },
          },
        },
      ]),
      Card.find({ lastTappedAt: { $ne: null } })
        .sort({ lastTappedAt: -1 })
        .limit(8)
        .select("cardNumber slug name mode redirectUrl lastTappedAt")
        .lean(),
    ]);

    const totalTaps = aggregateResult[0]?.totalViews || 0;
    const totalClicks = aggregateResult[0]?.totalLinkClicks || 0;
    const tapThroughRate =
      totalTaps > 0 ? Math.min(100, Number(((totalClicks / totalTaps) * 100).toFixed(1))) : 0;

    const recentTaps: RecentTapActivity[] = recentTappedDocs.map((c: any) => ({
      cardNumber: c.cardNumber || parseInt(c.slug, 10) || 1,
      slug: c.slug,
      cardName: c.name,
      mode: c.mode || "profile",
      redirectUrl: c.redirectUrl || "",
      timestamp: c.lastTappedAt ? new Date(c.lastTappedAt).toISOString() : new Date().toISOString(),
    }));

    return {
      totalCards: totalCards || 50,
      totalActive,
      totalTaps,
      totalRedirects,
      totalProfiles,
      topPerformer: topPerformerDoc
        ? {
            cardNumber: (topPerformerDoc as any).cardNumber || 1,
            name: (topPerformerDoc as any).name,
            jobTitle: (topPerformerDoc as any).jobTitle,
            views: (topPerformerDoc as any).views,
            slug: (topPerformerDoc as any).slug,
            avatarUrl: (topPerformerDoc as any).avatarUrl,
            mode: (topPerformerDoc as any).mode || "profile",
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
      totalRedirects: 0,
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
 * Update card details (Slot and Slug remain fixed 1-50).
 */
export async function updateCard(cardId: string, data: CardFormData) {
  try {
    await connectToDatabase();

    const existing = await Card.findById(cardId);
    if (!existing) {
      return { success: false, error: "Card not found" };
    }

    const cleanRedirectUrl = normalizeRedirectUrl(data.redirectUrl);

    existing.name = (data.name || "").trim() || `Card #${existing.cardNumber < 10 ? '0' + existing.cardNumber : existing.cardNumber}`;
    existing.jobTitle = data.jobTitle?.trim() || "";
    existing.department = data.department?.trim() || "Reach World";
    existing.headline = data.headline?.trim() || "";
    existing.location = data.location?.trim() || "Amman, Jordan";
    existing.avatarUrl = data.avatarUrl?.trim() || "";
    existing.themeColor = data.themeColor || "#0a192f";
    existing.phone = data.phone?.trim() || "";
    existing.email = data.email?.trim() || "";
    existing.mode = data.mode === "redirect" ? "redirect" : "profile";
    existing.redirectUrl = cleanRedirectUrl;

    if (typeof data.isActive === "boolean") {
      existing.isActive = data.isActive;
    }

    if (data.links && Array.isArray(data.links)) {
      existing.links = data.links as any;
    }

    await existing.save();

    revalidatePath("/dashboard");
    revalidatePath(`/${existing.slug}`);

    return { success: true, cardId: existing._id.toString(), slug: existing.slug };
  } catch (error: any) {
    console.error("Error updating card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Quick action to update card target destination (profile or direct redirect).
 */
export async function updateCardDestination(
  cardId: string,
  mode: CardModeType,
  redirectUrl: string
) {
  try {
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

/**
 * Creation of cards beyond 50 is strictly blocked.
 */
export async function createCard(_data: CardFormData) {
  return {
    success: false,
    error: "Reach World system is strictly configured for 50 fixed NFC cards (Cards #1 to #50). Cards cannot be added.",
  };
}

/**
 * Deletion of fixed cards is strictly blocked.
 */
export async function deleteCard(_cardId: string) {
  return {
    success: false,
    error: "Fixed physical NFC cards (1 to 50) cannot be deleted as their hardware URLs are permanently encoded.",
  };
}

/**
 * Reset a card slot to its default clean template without deleting the physical slot.
 */
export async function resetCard(cardId: string) {
  try {
    await connectToDatabase();

    const card = await Card.findById(cardId);
    if (!card) {
      return { success: false, error: "Card slot not found" };
    }

    const padded = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;

    card.name = `Card #${padded}`;
    card.jobTitle = "Team Member";
    card.department = "Reach World";
    card.headline = "Reach World NFC Smart Business Card";
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
 * Fetch a single card by ID.
 */
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
 * Fetch card by slug or cardNumber for public / redirect page.
 */
export async function getCardBySlug(slugOrNumber: string) {
  try {
    await connectToDatabase();

    const cleanParam = (slugOrNumber || "").trim().toLowerCase();
    const num = parseInt(cleanParam.replace(/^card-?/, ""), 10);

    const query: Record<string, unknown> = {
      $or: [
        { slug: cleanParam },
        ...(isNaN(num) ? [] : [{ cardNumber: num }, { slug: String(num) }]),
      ],
    };

    const doc = await Card.findOne(query).lean();
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
 * Records an NFC tap in real-time.
 */
export async function recordCardTap(cardId: string, metadata?: { userAgent?: string; referrer?: string }) {
  try {
    await connectToDatabase();

    await Card.findByIdAndUpdate(cardId, {
      $inc: { views: 1 },
      $set: { lastTappedAt: new Date() },
      $push: {
        tapsHistory: {
          $each: [
            {
              timestamp: new Date(),
              userAgent: metadata?.userAgent || "",
              referrer: metadata?.referrer || "",
            },
          ],
          $slice: -50, // Keep last 50 tap logs for memory efficiency
        },
      },
    });
  } catch (err) {
    console.error("Error recording card tap:", err);
  }
}

/**
 * Export the complete 50-card registry to CSV.
 */
export async function exportCardsToCSV(): Promise<string> {
  try {
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
      "Physical NFC URL",
      "Destination Mode",
      "Redirect Target URL",
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
      const mode = c.mode === "redirect" ? "Direct Redirect" : "Bio Profile";
      const lastTapped = c.lastTappedAt ? new Date(c.lastTappedAt).toLocaleString() : "Never";

      return [
        escape(c.cardNumber),
        escape(c.slug),
        escape(nfcUrl),
        escape(mode),
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
 * Batch update the 50 cards from parsed CSV.
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
        card.mode = r.mode.toLowerCase().includes("redirect") ? "redirect" : "profile";
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
