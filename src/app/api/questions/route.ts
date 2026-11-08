import { db } from "@/db";
import { questions } from "@/db/schema";
import { LEVELS } from "@/data/curriculum";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** GET /api/questions?level=1 — serve from DB, fallback to static curriculum */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const levelId = Number(searchParams.get("level"));

  try {
    if (levelId) {
      const rows = await db.select().from(questions).where(eq(questions.levelId, levelId));
      if (rows.length > 0) {
        return Response.json({
          source: "db",
          levelId,
          questions: rows.map((r) => ({
            id: r.questionId,
            chapter: r.chapter,
            difficulty: r.difficulty,
            type: r.type,
            question: r.question,
            options: r.options ?? undefined,
            correctAnswer: r.correctAnswer,
            acceptableAnswers: r.acceptableAnswers ?? undefined,
            explanation: r.explanation,
            hint: r.hint ?? undefined,
          })),
        });
      }
      const level = LEVELS.find((l) => l.id === levelId);
      if (!level) return Response.json({ error: "level not found" }, { status: 404 });
      return Response.json({ source: "static", levelId, questions: level.questions });
    }
    // all levels summary
    return Response.json({
      levels: LEVELS.map((l) => ({ id: l.id, chapterId: l.chapterId, title: l.title, questions: l.questions.length })),
    });
  } catch (e) {
    const level = LEVELS.find((l) => l.id === levelId);
    if (level) return Response.json({ source: "static-fallback", levelId, questions: level.questions });
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
