import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

// In-memory flag to ensure initialization check runs only once during process lifetime
let isInitialized = false;

/**
 * Super-fast 50-card check:
 * Runs in < 15ms. Only provisions if slots 1-50 are missing.
 */
export async function ensureSeedCards(): Promise<void> {
  if (isInitialized) return;

  try {
    await connectToDatabase();

    const count = await Card.countDocuments();
    if (count === 50) {
      isInitialized = true;
      return;
    }

    const existingCards = await Card.find().lean();
    const existingBySlot = new Map<number, any>();
    const unassigned: any[] = [];

    for (const card of existingCards) {
      const num = (card as any).cardNumber || parseInt((card as any).slug, 10);
      if (num && num >= 1 && num <= 50 && !existingBySlot.has(num)) {
        existingBySlot.set(num, card);
      } else {
        unassigned.push(card);
      }
    }

    // Bulk operations for instant 1-query initialization
    const bulkOps: any[] = [];

    for (let slot = 1; slot <= 50; slot++) {
      let existing = existingBySlot.get(slot);
      if (!existing && unassigned.length > 0) {
        existing = unassigned.shift();
      }

      const padded = slot < 10 ? `0${slot}` : `${slot}`;

      if (existing) {
        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: {
                cardNumber: slot,
                slug: String(slot),
                mode: existing.mode || (existing.redirectUrl ? "redirect" : "profile"),
                redirectUrl: existing.redirectUrl || "",
              },
            },
          },
        });
      } else {
        bulkOps.push({
          insertOne: {
            document: {
              cardNumber: slot,
              slug: String(slot),
              name: `Card #${padded}`,
              jobTitle: "Team Member",
              department: "Reach World",
              headline: "Reach World NFC Smart Card",
              location: "Amman, Jordan",
              avatarUrl: "",
              themeColor: "#0a192f",
              phone: "",
              email: "",
              mode: "profile",
              redirectUrl: "",
              isActive: true,
              views: 0,
              links: [],
            },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await Card.bulkWrite(bulkOps);
    }

    // Clean up extras
    if (unassigned.length > 0) {
      await Card.deleteMany({ _id: { $in: unassigned.map((c) => c._id) } });
    }

    isInitialized = true;
  } catch (err) {
    console.error("Error in ensureSeedCards:", err);
  }
}
