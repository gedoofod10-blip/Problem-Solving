import { db } from "@/db";
import { levelAttempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, levelId, score, total, xpEarned, passed } = body;
    if (!userId || !levelId) return Response.json({ error: "missing fields" }, { status: 400 });
    await db.insert(levelAttempts).values({
      userId: String(userId),
      levelId: Number(levelId),
      score: Number(score) || 0,
      total: Number(total) || 0,
      xpEarned: Number(xpEarned) || 0,
      passed: Boolean(passed),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  try {
    if (userId) {
      const rows = await db.select().from(levelAttempts).where(eq(levelAttempts.userId, userId)).orderBy(desc(levelAttempts.createdAt)).limit(50);
      return Response.json({ attempts: rows });
    }
    const rows = await db.select().from(levelAttempts).orderBy(desc(levelAttempts.createdAt)).limit(50);
    return Response.json({ attempts: rows });
  } catch {
    return Response.json({ attempts: [] });
  }
}
