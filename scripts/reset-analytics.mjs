import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const env = fs.readFileSync(".env.local", "utf8");
const uriMatch = env.match(/MONGODB_URI=(.+)/);
const uri = uriMatch[1].trim();

await mongoose.connect(uri);
const cardCol = mongoose.connection.db.collection("cards");

// Update all cards: reset views, vcardClicks, lastTappedAt
const res1 = await cardCol.updateMany({}, {
  $set: {
    views: 0,
    vcardClicks: 0,
    lastTappedAt: null,
  }
});

// Reset clicks on all link subdocuments
const allCards = await cardCol.find().toArray();
for (const card of allCards) {
  if (Array.isArray(card.links) && card.links.length > 0) {
    const updatedLinks = card.links.map(l => ({ ...l, clicks: 0 }));
    await cardCol.updateOne({ _id: card._id }, { $set: { links: updatedLinks } });
  }
}

// Verify totals
const updatedCards = await cardCol.find().toArray();
let totalViews = 0;
let totalVcard = 0;
let totalLinkClicks = 0;
for (const c of updatedCards) {
  totalViews += (c.views || 0);
  totalVcard += (c.vcardClicks || 0);
  if (Array.isArray(c.links)) {
    for (const l of c.links) {
      totalLinkClicks += (l.clicks || 0);
    }
  }
}

console.log("Successfully zeroed out all analytics!");
console.log("Total Cards:", updatedCards.length);
console.log("Total Views (Scans):", totalViews);
console.log("Total vCard Clicks:", totalVcard);
console.log("Total Link Clicks:", totalLinkClicks);

await mongoose.disconnect();
