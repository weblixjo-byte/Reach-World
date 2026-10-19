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

export interface ICard extends Document {
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
  isActive: boolean;
  views: number;
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

const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
