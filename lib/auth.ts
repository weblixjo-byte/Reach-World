import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/models/User";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "reach-world-nfc-ultra-secure-key-2026-vct-94817265934-prod";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "rw_session_v2";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Ensures the default admin account exists.
 * Username: admin
 * Password: 0000
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    await connectToDatabase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("0000", salt);

    const existingAdmin = await User.findOne({
      $or: [{ email: "admin" }, { email: "admin@reachworld.com" }, { role: "admin" }],
    });

    if (existingAdmin) {
      existingAdmin.email = "admin";
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.name = "Reach World Admin";
      await existingAdmin.save();
    } else {
      await User.create({
        email: "admin",
        passwordHash,
        name: "Reach World Admin",
        role: "admin",
      });
    }
  } catch (err) {
    console.error("[Auth] Error ensuring default admin:", err);
  }
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

    const cleanInput = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanInput },
        { email: cleanInput === "admin" ? "admin@reachworld.com" : cleanInput },
        { email: "admin" },
        { role: "admin" },
      ],
    });

    if (!user) {
      return { success: false, error: "Invalid username or password." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
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
    if (!cleanEmail) {
      return { success: false, error: "Username or email is required." };
    }

    // Check if new email taken by another user
    if (cleanEmail !== user.email) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return { success: false, error: "This username or email is already in use." };
      }
      user.email = cleanEmail;
    }

    if (newName && newName.trim()) {
      user.name = newName.trim();
    }

    if (newPassword && newPassword.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    } else if (newPassword && newPassword.trim().length > 0 && newPassword.trim().length < 4) {
      return { success: false, error: "New password must be at least 4 characters long." };
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
