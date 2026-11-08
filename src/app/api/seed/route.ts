import { db } from "@/db";
import { questions } from "@/db/schema";
import { LEVELS } from "@/data/curriculum";

export const dynamic = "force-dynamic";

/** POST /api/seed — populate the questions bank from the static curriculum */
export async function POST() {
  try {
    let inserted = 0;
    for (const level of LEVELS) {
      for (const q of level.questions) {
        await db
          .insert(questions)
          .values({
            questionId: q.id,
            levelId: level.id,
            chapter: q.chapter,
            difficulty: q.difficulty,
            type: q.type,
            question: q.question,
            options: q.options ?? null,
            correctAnswer: q.correctAnswer,
            acceptableAnswers: q.acceptableAnswers ?? null,
            explanation: q.explanation,
            hint: q.hint ?? null,
          })
          .onConflictDoNothing({ target: questions.questionId });
        inserted++;
      }
    }
    return Response.json({ ok: true, processed: inserted });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
