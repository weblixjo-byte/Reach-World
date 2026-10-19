import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

export const runtime = "nodejs";

/**
 * Lightweight edge tracker:
 * Enriches visitor location using Vercel Geo headers + ISP/Reverse Geocoding fallback
 * to provide granular location details (District/Region, City, Country) without prompting user for GPS permissions.
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
      // 1. Extract Vercel/Cloudflare Edge Geo Headers
      const rawCity =
        req.headers.get("x-vercel-ip-city") ||
        req.headers.get("cf-ipcity") ||
        "";
      const rawRegion =
        req.headers.get("x-vercel-ip-country-region") ||
        req.headers.get("cf-region") ||
        "";
      const rawCountry =
        req.headers.get("x-vercel-ip-country") ||
        req.headers.get("cf-ipcountry") ||
        "";
      const latitude = req.headers.get("x-vercel-ip-latitude");
      const longitude = req.headers.get("x-vercel-ip-longitude");

      let readableLocation = "";

      const city = rawCity ? decodeURIComponent(rawCity) : "";
      const region = rawRegion ? decodeURIComponent(rawRegion) : "";
      const country = rawCountry ? decodeURIComponent(rawCountry) : "";

      // Construct detailed location hierarchy
      if (city && region && region.toLowerCase() !== city.toLowerCase()) {
        readableLocation = `${city} (${region}), ${country}`;
      } else if (city && country) {
        readableLocation = `${city}, ${country}`;
      } else if (region && country) {
        readableLocation = `${region}, ${country}`;
      } else if (country) {
        readableLocation = country;
      }

      // If on localhost or missing edge headers, try client IP reverse lookup
      if (!readableLocation) {
        const forwarded = req.headers.get("x-forwarded-for");
        const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip");

        if (clientIp && !clientIp.startsWith("127.") && !clientIp.startsWith("192.168.") && clientIp !== "::1") {
          try {
            const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
              signal: AbortSignal.timeout(2500),
            });
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.city && geoData.country_name) {
                const sub = geoData.region ? ` (${geoData.region})` : "";
                readableLocation = `${geoData.city}${sub}, ${geoData.country_name}`;
              }
            }
          } catch {}
        }
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
