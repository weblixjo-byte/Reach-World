import mongoose, { Schema, Document, Model } from "mongoose";

export type LinkIconType =
  | "website"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "maps"
  | "phone"
  | "linkedin"
  | "custom";

export interface ILink {
  _id?: string;
  title: string;
  url: string;
  icon: LinkIconType;
  isActive: boolean;
  clicks: number;
}

export interface ICard extends Document {
  name: string;
  slug: string;
  jobTitle: string;
  department: string;
  headline: string;
  location: string;
  avatarUrl: string;
  themeColor: string;
  isActive: boolean;
  views: number;
  links: ILink[];
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  icon: {
    type: String,
    enum: ["website", "whatsapp", "instagram", "facebook", "maps", "phone", "linkedin", "custom"],
    default: "website",
  },
  isActive: { type: Boolean, default: true },
  clicks: { type: Number, default: 0 },
});

const CardSchema = new Schema<ICard>(
  {
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
      default: "General",
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
      default: "Dubai, UAE",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    themeColor: {
      type: String,
      default: "#2594a3",
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
    links: {
      type: [LinkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation in development / hot reload
const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
