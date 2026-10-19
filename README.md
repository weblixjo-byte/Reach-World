# Reach World — Apple-Grade Digital Bio & NFC Cards SaaS

An ultra-minimalist, production-ready SaaS application for creating, managing, and distributing Digital Bio / NFC Business Cards for **Reach World**, supporting 200 to 2,000+ corporate cards, engineered strictly following Apple's signature design language (**macOS Sequoia & iOS 18 Light Mode**).

---

## 🛠️ Tech Stack & Engineering Highlights

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **UI Library**: React 19, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with Apple Design Tokens (`#F5F5F7` Canvas, `#0071E3` System Blue, `#34C759` System Green, diffused shadows, squircle avatars)
- **Icons**: Lucide Icons & Custom SVG Social Badges
- **Database**: MongoDB via Mongoose with **cached singleton connection pooling** (`maxPoolSize: 5`)
- **Hosting & Edge**: Vercel Serverless & Edge Cache with On-Demand Revalidation (`revalidatePath`) and ISR (`revalidate = 60`) for public bio cards with zero unnecessary database queries.
- **Analytics**: Atomic increments (`$inc: { views: 1 }`) via `/api/track` route.

---

## 🚀 Key Features

1. **Desktop-Only Executive Dashboard (`/dashboard`)**:
   - Screen guard (`DesktopOnlyGuard`) for displays `< 1024px` with an Apple-style disclaimer.
   - macOS Sequoia Window Frame with interactive traffic light controls and frosted pill navigation.
   - 4 Apple-grade KPI metric cards: Total Cards, Total Taps (+18% trend), Top Visited Employee, and CTR.
   - Debounced real-time search across names, slugs, job titles, and departments.
   - Apple Segmented Control: `[ All | Active | Paused ]` and dynamic department dropdown.
   - Instant iOS green toggle switch (`#34C759`) to pause/activate cards with zero delay.
   - One-Click **CSV Export** engineered specifically for the NFC Printing Factory (`Name`, `Job Title`, `Department`, `Full Card URL`, `QR Code Link`, `Status`).

2. **Live iPhone 16 Pro Mockup**:
   - Real-time synchronization while creating or editing cards.
   - Dynamic Island, native status bar, squircle avatar, contact download (`.vcf`), and interactive bio links.

3. **Public Mobile-First Bio Card (`/[slug]`)**:
   - Total payload `< 20KB` for lightning-fast NFC tap load times.
   - Vercel Edge Cached with 60-second ISR.
   - Supports Arabic & English slug auto-generation.
   - 1-tap "Add to Phone Contacts" with vCard generation and celebration confetti.
   - Clear corporate fallback when a card is paused by Reach World.

---

## ⚙️ Quick Start

### 1. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your MongoDB URI (local or MongoDB Atlas):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/reach_world
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Development
Run the development server:
```bash
npm run dev
```

Visit:
- Executive Dashboard: `http://localhost:3000/dashboard`
- Public Bio Card: `http://localhost:3000/ahmad-khalil`

### 3. Production Build
```bash
npm run build
npm run start
```
