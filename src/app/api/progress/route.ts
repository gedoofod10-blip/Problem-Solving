import { db } from "@/db";
import { playerStats } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });
  try {
    const rows = await db.select().from(playerStats).where(eq(playerStats.userId, userId));
    return Response.json({ stats: rows[0] ?? null });
  } catch {
    return Response.json({ stats: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, xp, streak, unlockedLevels, completedLevels, lastActive, totalCorrect } = body;
    if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

    await db
      .insert(playerStats)
      .values({
        userId: String(userId),
        xp: Number(xp) || 0,
        streak: Number(streak) || 0,
        unlockedLevels: Array.isArray(unlockedLevels) ? unlockedLevels : [1],
        completedLevels: Array.isArray(completedLevels) ? completedLevels : [],
        totalCorrect: Number(totalCorrect) || 0,
        lastActive: lastActive ? String(lastActive) : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: playerStats.userId,
        set: {
          xp: sql`GREATEST(${playerStats.xp}, ${Number(xp) || 0})`,
          streak: Number(streak) || 0,
          unlockedLevels: Array.isArray(unlockedLevels) ? unlockedLevels : [1],
          completedLevels: Array.isArray(completedLevels) ? completedLevels : [],
          totalCorrect: sql`GREATEST(${playerStats.totalCorrect}, ${Number(totalCorrect) || 0})`,
          lastActive: lastActive ? String(lastActive) : null,
          updatedAt: new Date(),
        },
      });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 });
  }
}
