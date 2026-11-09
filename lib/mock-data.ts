import { connectToDatabase } from "@/lib/db";
import Card, { ICard } from "@/models/Card";

/**
 * Ensures exactly 50 fixed cards (Slots 1 to 50) exist in the database.
 * Slugs are strictly "1", "2", ..., "50" matching physical NFC tags.
 */
export async function ensureSeedCards(): Promise<void> {
  try {
    await connectToDatabase();

    const existingCards = await Card.find().lean();
    const existingBySlot = new Map<number, any>();
    const unassignedCards: any[] = [];

    // Map existing cards to slots 1-50
    for (const card of existingCards) {
      const numFromSlug = parseInt((card as any).slug, 10);
      const slotNum = (card as any).cardNumber || (numFromSlug >= 1 && numFromSlug <= 50 ? numFromSlug : null);

      if (slotNum && slotNum >= 1 && slotNum <= 50 && !existingBySlot.has(slotNum)) {
        existingBySlot.set(slotNum, card);
      } else {
        unassignedCards.push(card);
      }
    }

    // Provision all slots 1 to 50
    for (let slot = 1; slot <= 50; slot++) {
      let cardForSlot = existingBySlot.get(slot);

      if (!cardForSlot && unassignedCards.length > 0) {
        cardForSlot = unassignedCards.shift();
      }

      if (cardForSlot) {
        // Update to guarantee correct slot, slug, and mode
        await Card.findByIdAndUpdate(cardForSlot._id, {
          $set: {
            cardNumber: slot,
            slug: String(slot),
            mode: cardForSlot.mode || (cardForSlot.redirectUrl ? "redirect" : "profile"),
            redirectUrl: cardForSlot.redirectUrl || "",
          },
        });
      } else {
        // Create new default slot card
        const padded = slot < 10 ? `0${slot}` : `${slot}`;
        await Card.create({
          cardNumber: slot,
          slug: String(slot),
          name: `Card #${padded}`,
          jobTitle: "Team Member",
          department: "Reach World",
          headline: "Reach World NFC Smart Business Card",
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
        });
      }
    }

    // Clean up any remaining unassigned cards beyond 50 to guarantee STRICTLY 50 cards
    if (unassignedCards.length > 0) {
      const extraIds = unassignedCards.map((c) => c._id);
      await Card.deleteMany({ _id: { $in: extraIds } });
    }
  } catch (error) {
    console.error("Error ensuring 50 fixed cards:", error);
  }
}
