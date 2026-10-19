import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

export const runtime = "nodejs";

/**
 * Pure fire-and-forget view/click counter
 * Clean atomic increment with zero external tracking
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
      await Card.updateOne(query, { $inc: { views: 1 } });
    } else if (type === "click" && linkId) {
      await Card.updateOne(
        { ...query, "links._id": linkId },
        { $inc: { "links.$.clicks": 1 } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 200 });
  }
}
