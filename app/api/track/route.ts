import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

export const runtime = "nodejs";

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

// Cleanup rate limit map every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 600000);
}

/**
 * Pure fire-and-forget view/click counter with rate-limiting and validation
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(clientIp, 60, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { slug, cardId, type, linkId, icon } = body;

    if (!slug && !cardId) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    // Sanitize identifier
    const cleanSlug = typeof slug === "string" ? slug.trim().slice(0, 50) : null;
    const cleanCardId = typeof cardId === "string" ? cardId.trim().slice(0, 50) : null;

    await connectToDatabase();

    const query: Record<string, unknown> = cleanSlug
      ? { slug: cleanSlug }
      : { _id: cleanCardId };

    if (type === "view") {
      await Card.updateOne(query, { $inc: { views: 1 }, $set: { lastTappedAt: new Date() } });
    } else if (type === "vcard" || type === "save_contact" || icon === "vcard") {
      await Card.updateOne(query, { $inc: { vcardClicks: 1 } });
    } else if (type === "click") {
      let updated = false;

      // 1. Try updating by subdocument _id if provided
      if (linkId && typeof linkId === "string") {
        const cleanLinkId = linkId.trim().slice(0, 50);
        const res = await Card.updateOne(
          { ...query, "links._id": cleanLinkId } as any,
          { $inc: { "links.$.clicks": 1 } }
        );
        if (res.matchedCount > 0) updated = true;
      }

      // 2. If not matched by _id or no _id provided, match by icon
      if (!updated && icon && typeof icon === "string") {
        const cleanIcon = icon.trim().slice(0, 30);
        await Card.updateOne(
          { ...query, "links.icon": cleanIcon } as any,
          { $inc: { "links.$.clicks": 1 } }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
