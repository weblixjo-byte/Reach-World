import { connectToDatabase } from "@/lib/db";
import Card from "@/models/Card";

/**
 * No automatic mock cards created - the database remains 100% clean for Reach World.
 */
export async function ensureSeedCards(): Promise<void> {
  // Empty seed ensures only real user-created Reach World cards exist in the database
}
