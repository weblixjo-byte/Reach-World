import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

export const runtime = "nodejs";

/**
 * Lightweight fire-and-forget edge/API tracker
 * Automatically extracts geo-location headers from the visitor request (Vercel Edge or Cloudflare)
 * with ZERO browser permissions required!
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
      // Extract automatic Geo-IP headers without asking user permissions
      const city =
        req.headers.get("x-vercel-ip-city") ||
        req.headers.get("cf-ipcity") ||
        "";
      const country =
        req.headers.get("x-vercel-ip-country") ||
        req.headers.get("cf-ipcountry") ||
        "";

      let readableLocation = "";
      if (city && country) {
        readableLocation = `${decodeURIComponent(city)}, ${country}`;
      } else if (country) {
        readableLocation = country;
      } else if (city) {
        readableLocation = decodeURIComponent(city);
      }

      const updateData: Record<string, any> = {
        $inc: { views: 1 },
        $set: {
          lastTapAt: new Date(),
        },
      };

      if (readableLocation) {
        updateData.$set.lastTapLocation = readableLocation;
        updateData.$set.lastTapCountry = country;
      }

      await Card.updateOne(query, updateData);
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
