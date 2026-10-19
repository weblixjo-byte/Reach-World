"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Card, { ICard, ILink } from "@/models/Card";
import { formatSlug } from "@/lib/slugify";
import { ensureSeedCards } from "@/lib/mock-data";

async function generateUniqueSlug(baseName: string, existingId?: string): Promise<string> {
  await connectToDatabase();
  const baseSlug = formatSlug(baseName) || "reach-card";
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug: candidateSlug };
    if (existingId) {
      query._id = { $ne: existingId };
    }

    const existing = await Card.findOne(query).select("_id").lean();
    if (!existing) {
      return candidateSlug;
    }

    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }
}

export interface CardListItem {
  _id: string;
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
  isActive: boolean;
  views: number;
  lastTapLocation?: string;
  lastTapLat?: number;
  lastTapLng?: number;
  lastTapAt?: string;
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

export interface AnalyticsSummary {
  totalCards: number;
  totalActive: number;
  totalTaps: number;
  topPerformer: {
    name: string;
    jobTitle: string;
    views: number;
    slug: string;
    avatarUrl: string;
  } | null;
  tapThroughRate: number;
}

/**
 * Fetch paginated cards with projected fields for high performance.
 */
export async function getCards({
  page = 1,
  limit = 20,
  search = "",
  department = "",
  status = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}): Promise<GetCardsResponse> {
  try {
    await connectToDatabase();
    await ensureSeedCards();

    const query: Record<string, unknown> = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { jobTitle: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "paused") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [rawCards, total, distinctDepts] = await Promise.all([
      Card.find(query)
        .select(
          "name slug jobTitle department headline location avatarUrl themeColor isActive views links lastTapLocation lastTapLat lastTapLng lastTapAt updatedAt"
        )
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Card.countDocuments(query),
      Card.distinct("department"),
    ]);

    const cards: CardListItem[] = rawCards.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      jobTitle: doc.jobTitle || "",
      department: doc.department || "General",
      headline: doc.headline || "",
      location: doc.location || "",
      avatarUrl: doc.avatarUrl || "",
      themeColor: doc.themeColor || "#2594a3",
      isActive: doc.isActive ?? true,
      views: doc.views || 0,
      lastTapLocation: doc.lastTapLocation || "",
      lastTapLat: doc.lastTapLat || undefined,
      lastTapLng: doc.lastTapLng || undefined,
      lastTapAt: doc.lastTapAt ? new Date(doc.lastTapAt).toISOString() : undefined,
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
 * Computes analytics overview: total active cards, views, top performer, CTR.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    await connectToDatabase();
    await ensureSeedCards();

    const [totalCards, totalActive, topPerformerDoc, aggregateResult] =
      await Promise.all([
        Card.countDocuments(),
        Card.countDocuments({ isActive: true }),
        Card.findOne({ isActive: true })
          .sort({ views: -1 })
          .select("name jobTitle views slug avatarUrl")
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
      ]);

    const totalTaps = aggregateResult[0]?.totalViews || 0;
    const totalClicks = aggregateResult[0]?.totalLinkClicks || 0;
    const tapThroughRate =
      totalTaps > 0 ? Math.min(100, Number(((totalClicks / totalTaps) * 100).toFixed(1))) : 0;

    return {
      totalCards,
      totalActive,
      totalTaps,
      topPerformer: topPerformerDoc
        ? {
            name: (topPerformerDoc as any).name,
            jobTitle: (topPerformerDoc as any).jobTitle,
            views: (topPerformerDoc as any).views,
            slug: (topPerformerDoc as any).slug,
            avatarUrl: (topPerformerDoc as any).avatarUrl,
          }
        : null,
      tapThroughRate: tapThroughRate || 0,
    };
  } catch (error) {
    console.error("Error in getAnalyticsSummary:", error);
    return {
      totalCards: 0,
      totalActive: 0,
      totalTaps: 0,
      topPerformer: null,
      tapThroughRate: 0,
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
    ).select("slug");

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
  slug?: string;
  jobTitle?: string;
  department?: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  themeColor?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  links?: ILink[];
}

/**
 * Create a new employee card.
 */
export async function createCard(data: CardFormData) {
  try {
    await connectToDatabase();

    const slug = data.slug?.trim()
      ? await generateUniqueSlug(data.slug)
      : await generateUniqueSlug(data.name);

    const newCard = await Card.create({
      name: data.name.trim(),
      slug,
      jobTitle: data.jobTitle?.trim() || "",
      department: data.department?.trim() || "General",
      headline: data.headline?.trim() || "",
      location: data.location?.trim() || "Dubai, UAE",
      avatarUrl: data.avatarUrl?.trim() || "",
      themeColor: data.themeColor || "#2594a3",
      phone: data.phone?.trim() || "",
      email: data.email?.trim() || "",
      isActive: data.isActive ?? true,
      links: data.links || [],
    });

    revalidatePath("/dashboard");
    revalidatePath(`/${newCard.slug}`);

    return { success: true, cardId: newCard._id.toString(), slug: newCard.slug };
  } catch (error: any) {
    console.error("Error creating card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing card.
 */
export async function updateCard(cardId: string, data: CardFormData) {
  try {
    await connectToDatabase();

    const existing = await Card.findById(cardId);
    if (!existing) {
      return { success: false, error: "Card not found" };
    }

    let finalSlug = existing.slug;
    if (data.slug && data.slug.trim() !== existing.slug) {
      finalSlug = await generateUniqueSlug(data.slug, cardId);
    }

    const oldSlug = existing.slug;

    existing.name = data.name.trim();
    existing.slug = finalSlug;
    existing.jobTitle = data.jobTitle?.trim() || "";
    existing.department = data.department?.trim() || "General";
    existing.headline = data.headline?.trim() || "";
    existing.location = data.location?.trim() || "";
    existing.avatarUrl = data.avatarUrl?.trim() || "";
    existing.themeColor = data.themeColor || "#2594a3";
    if (typeof data.phone === "string") {
      existing.phone = data.phone.trim();
    }
    if (typeof data.email === "string") {
      existing.email = data.email.trim();
    }
    if (typeof data.isActive === "boolean") {
      existing.isActive = data.isActive;
    }
    if (data.links) {
      existing.links = data.links;
    }

    await existing.save();

    revalidatePath("/dashboard");
    revalidatePath(`/${oldSlug}`);
    if (oldSlug !== finalSlug) {
      revalidatePath(`/${finalSlug}`);
    }

    return { success: true, cardId: existing._id.toString(), slug: finalSlug };
  } catch (error: any) {
    console.error("Error updating card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a card by ID.
 */
export async function deleteCard(cardId: string) {
  try {
    await connectToDatabase();
    const deleted = await Card.findByIdAndDelete(cardId).select("slug");
    revalidatePath("/dashboard");
    if (deleted?.slug) {
      revalidatePath(`/${deleted.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting card:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch a single card by ID (for editing).
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
 * Fetch card by slug for public page.
 */
export async function getCardBySlug(slug: string) {
  try {
    await connectToDatabase();
    const doc = await Card.findOne({ slug }).lean();
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
 * Export cards into clean CSV format for NFC Printing Factory.
 * Columns: Name, Job Title, Department, Full Card URL, QR Code Link, Status
 */
export async function exportCardsToCSV(): Promise<string> {
  try {
    await connectToDatabase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://reachworld.com";
    const cards = await Card.find()
      .select("name jobTitle department slug isActive")
      .sort({ name: 1 })
      .lean();

    const headers = ["Name", "Job Title", "Department", "Full Card URL", "QR Code Link", "Status"];
    const rows = cards.map((c: any) => {
      const fullUrl = `${baseUrl}/${c.slug}`;
      const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        fullUrl
      )}`;
      const status = c.isActive ? "Active" : "Paused";

      const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;

      return [
        escape(c.name),
        escape(c.jobTitle),
        escape(c.department),
        escape(fullUrl),
        escape(qrLink),
        escape(status),
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\r\n");
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return "";
  }
}
