import { connectToDatabase } from "@/lib/db";
import Card, { ICard, LinkIconType } from "@/models/Card";

export interface MockEmployee {
  name: string;
  jobTitle: string;
  department: string;
  headline: string;
  location: string;
  avatarUrl: string;
  themeColor: string;
  isActive: boolean;
  views: number;
  links: {
    title: string;
    url: string;
    icon: LinkIconType;
    isActive: boolean;
    clicks: number;
  }[];
}

export const SAMPLE_EMPLOYEES: MockEmployee[] = [
  {
    name: "Ahmad Khalil",
    jobTitle: "Managing Director",
    department: "Management",
    headline: "Connecting global ventures across GCC & international markets",
    location: "Dubai, UAE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    themeColor: "#2594a3",
    isActive: true,
    views: 1420,
    links: [
      { title: "Reach World Portal", url: "https://reachworld.com", icon: "website", isActive: true, clicks: 432 },
      { title: "Direct WhatsApp", url: "https://wa.me/971501234567", icon: "whatsapp", isActive: true, clicks: 512 },
      { title: "LinkedIn Profile", url: "https://linkedin.com", icon: "linkedin", isActive: true, clicks: 310 },
      { title: "Reach Dubai HQ Map", url: "https://maps.google.com", icon: "maps", isActive: true, clicks: 166 },
    ],
  },
  {
    name: "Sarah Al-Nuaimi",
    jobTitle: "Head of Corporate Partnerships",
    department: "Sales",
    headline: "Strategic expansions & enterprise RFID/NFC solutions",
    location: "Abu Dhabi, UAE",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    themeColor: "#0071E3",
    isActive: true,
    views: 980,
    links: [
      { title: "Book a Partnership Meeting", url: "https://calendly.com", icon: "website", isActive: true, clicks: 340 },
      { title: "Corporate WhatsApp", url: "https://wa.me/971509876543", icon: "whatsapp", isActive: true, clicks: 412 },
      { title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", isActive: true, clicks: 228 },
    ],
  },
  {
    name: "Tariq Mansour",
    jobTitle: "VP of Operations & Logistics",
    department: "Operations",
    headline: "Streamlining end-to-end supply chain & smart hardware distribution",
    location: "Riyadh, KSA",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    themeColor: "#34C759",
    isActive: true,
    views: 640,
    links: [
      { title: "Operations Hub", url: "https://reachworld.com/ops", icon: "website", isActive: true, clicks: 180 },
      { title: "Call Direct", url: "tel:+966500123456", icon: "phone", isActive: true, clicks: 260 },
      { title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", isActive: true, clicks: 200 },
    ],
  },
  {
    name: "Layla Hassan",
    jobTitle: "Chief People Officer",
    department: "HR",
    headline: "Nurturing world-class talent and organizational culture",
    location: "Dubai, UAE",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    themeColor: "#FF2D55",
    isActive: true,
    views: 520,
    links: [
      { title: "Reach Careers", url: "https://reachworld.com/careers", icon: "website", isActive: true, clicks: 310 },
      { title: "HR Inquiries (WhatsApp)", url: "https://wa.me/971504443322", icon: "whatsapp", isActive: true, clicks: 145 },
      { title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", isActive: true, clicks: 65 },
    ],
  },
  {
    name: "Zaid Al-Farsi",
    jobTitle: "Senior Solution Architect",
    department: "Engineering",
    headline: "Edge infrastructure, microservices & IoT smart tags",
    location: "Doha, Qatar",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    themeColor: "#5856D6",
    isActive: false,
    views: 310,
    links: [
      { title: "Reach Tech Specs", url: "https://reachworld.com/docs", icon: "website", isActive: true, clicks: 120 },
      { title: "Developer Contact", url: "https://wa.me/97455001122", icon: "whatsapp", isActive: true, clicks: 90 },
      { title: "GitHub", url: "https://github.com", icon: "custom", isActive: true, clicks: 100 },
    ],
  },
];

export async function ensureSeedCards(): Promise<void> {
  try {
    await connectToDatabase();
    const count = await Card.countDocuments();
    if (count === 0) {
      console.log("Seeding sample Reach World cards...");
      for (const item of SAMPLE_EMPLOYEES) {
        const slug = item.name.toLowerCase().replace(/\s+/g, "-");
        await Card.create({
          ...item,
          slug,
        });
      }
      console.log("Seed cards created successfully.");
    }
  } catch (err) {
    console.warn("Could not seed cards:", err);
  }
}
