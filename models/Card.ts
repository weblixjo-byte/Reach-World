import mongoose, { Schema, Document, Model } from "mongoose";

export type LinkIconType =
  | "phone"
  | "whatsapp"
  | "email"
  | "website"
  | "maps"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "twitter"
  | "custom";

export interface ILink {
  _id?: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: LinkIconType;
  isActive: boolean;
  clicks: number;
}

export type CardModeType = "profile" | "redirect";

export interface ITapLog {
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
}

export interface ICard extends Document {
  cardNumber: number;
  name: string;
  slug: string;
  jobTitle: string;
  department: string;
  headline: string;
  location: string;
  avatarUrl: string;
  themeColor: string;
  phone?: string;
  email?: string;
  mode: CardModeType;
  redirectUrl?: string;
  isActive: boolean;
  views: number;
  vcardClicks?: number;
  lastTappedAt?: Date;
  tapsHistory?: ITapLog[];
  links: ILink[];
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true, default: "" },
  url: { type: String, required: true, trim: true },
  icon: {
    type: String,
    enum: [
      "phone",
      "whatsapp",
      "email",
      "website",
      "maps",
      "linkedin",
      "instagram",
      "facebook",
      "twitter",
      "custom",
    ],
    default: "website",
  },
  isActive: { type: Boolean, default: true },
  clicks: { type: Number, default: 0 },
});

const CardSchema = new Schema<ICard>(
  {
    cardNumber: {
      type: Number,
      required: [true, "Card Number (1-50) is required"],
      min: 1,
      max: 50,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "Reach World",
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "Amman, Jordan",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    themeColor: {
      type: String,
      default: "#0a192f",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    mode: {
      type: String,
      enum: ["profile", "redirect"],
      default: "profile",
      index: true,
    },
    redirectUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    vcardClicks: {
      type: Number,
      default: 0,
    },
    lastTappedAt: {
      type: Date,
      default: null,
    },
    tapsHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        referrer: { type: String, default: "" },
        userAgent: { type: String, default: "" },
      },
    ],
    links: {
      type: [LinkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
