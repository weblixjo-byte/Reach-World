import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://mohammadweblixjo_db_user:WFQLZLs1d8wSn1fk@reach-world.bmsmlq7.mongodb.net/reach_world?retryWrites=true&w=majority";

async function resetAll() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const collection = mongoose.connection.collection("cards");
  console.log("Wiping all existing card records...");
  await collection.deleteMany({});

  console.log("Creating 50 pristine, clean cards (Slots 01 - 50)...");
  const cards = [];
  for (let i = 1; i <= 50; i++) {
    const padded = i < 10 ? `0${i}` : `${i}`;
    cards.push({
      cardNumber: i,
      slug: String(i),
      name: `Card #${padded}`,
      jobTitle: "",
      department: "Reach World",
      headline: "",
      location: "Amman, Jordan",
      avatarUrl: "",
      themeColor: "#0a192f",
      phone: "",
      email: "",
      mode: "profile",
      redirectUrl: "",
      isActive: true,
      views: 0,
      vcardClicks: 0,
      tapsHistory: [],
      links: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await collection.insertMany(cards);
  console.log("Successfully created 50 clean cards (1-50) from scratch!");

  await mongoose.disconnect();
  console.log("Done.");
}

resetAll().catch((err) => {
  console.error("Error resetting:", err);
  process.exit(1);
});
