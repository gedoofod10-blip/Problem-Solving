import { db } from "@/db";
import { playerStats } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(playerStats).orderBy(desc(playerStats.xp)).limit(20);
    return Response.json({
      leaders: rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId.slice(0, 8) + "…",
        xp: r.xp,
        streak: r.streak,
        completed: (r.completedLevels ?? []).length,
      })),
    });
  } catch {
    return Response.json({ leaders: [] });
  }
}
