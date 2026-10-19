import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

export const runtime = "nodejs";

/**
 * Lightweight fire-and-forget edge/API tracker
 * POST /api/track
 * Body: { slug?: string, cardId?: string, type: 'view' | 'click', linkId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, cardId, type, linkId } = body;

    if (!slug && !cardId) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    await connectToDatabase();

    const query: Record<string, unknown> = slug ? { slug } : { _id: cardId };

    if (type === "view") {
      // Atomic increment with zero document overhead
      await Card.updateOne(query, { $inc: { views: 1 } });
    } else if (type === "click" && linkId) {
      await Card.updateOne(
        { ...query, "links._id": linkId },
        { $inc: { "links.$.clicks": 1 } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Return quiet 200 so visitor telemetry never breaks UX
    return NextResponse.json({ success: false, error: err?.message }, { status: 200 });
  }
}
