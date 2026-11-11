import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/models/User";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "reach-world-nfc-ultra-secure-key-2026-vct-94817265934-prod";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "rw_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

let isAdminInitialized = false;

/**
 * Ensures the default admin account exists.
 * Username: admin@reachworld.com
 * Password: Hussein
 */
export async function ensureDefaultAdmin(): Promise<void> {
  if (isAdminInitialized) return;
  await connectToDatabase();
  const existingCount = await User.countDocuments();
  if (existingCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Hussein", salt);
    await User.create({
      email: "admin@reachworld.com",
      passwordHash,
      name: "Reach World Admin",
      role: "admin",
    });
    console.log("[Auth] Default admin initialized: admin@reachworld.com / Hussein");
  }
  isAdminInitialized = true;
}

/**
 * Create a signed JWT token for session
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user session from HTTP-only cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Strict server action guard: throws error if not authenticated
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Session expired or invalid. Please log in.");
  }
  return session;
}

/**
 * Log in admin with credentials, set secure cookie
 */
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    await ensureDefaultAdmin();

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    user.lastLogin = new Date();
    await user.save();

    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "Authentication system error. Please try again." };
  }
}

/**
 * Log out and clear cookie
 */
export async function logoutAdmin(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {}
}

/**
 * Get current admin user details for settings
 */
export async function getAdminProfile(): Promise<{ email: string; name: string } | null> {
  try {
    const session = await requireAuth();
    await connectToDatabase();
    const user = await User.findById(session.userId).select("email name").lean();
    if (!user) return null;
    return { email: user.email, name: user.name };
  } catch {
    return null;
  }
}

/**
 * Update Admin Credentials (username/email and password)
 */
export async function updateAdminCredentials(
  newEmail: string,
  currentPassword: string,
  newPassword?: string,
  newName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Check if new email taken by another user
    if (cleanEmail !== user.email) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return { success: false, error: "This email address is already in use." };
      }
      user.email = cleanEmail;
    }

    if (newName && newName.trim()) {
      user.name = newName.trim();
    }

    if (newPassword && newPassword.trim().length >= 5) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    } else if (newPassword && newPassword.trim().length > 0 && newPassword.trim().length < 5) {
      return { success: false, error: "New password must be at least 5 characters long." };
    }

    await user.save();

    // Re-issue cookie with updated email
    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update credentials error:", error);
    return { success: false, error: error.message || "Failed to update credentials." };
  }
}
