import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { LEVELS, getLevel, getChapter } from "@/data/curriculum";
import QuizGate from "./QuizGate";

export function generateStaticParams() {
  return LEVELS.map((l) => ({ id: String(l.id) }));
}

export default async function LevelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const levelId = Number(id);
  const level = getLevel(levelId);
  if (!level) notFound();
  const chapter = getChapter(level.chapterId)!;

  return <QuizGate level={level} chapterTitle={chapter.title} chapterColor={chapter.color} />;
}

export function LockedLevel({ levelId }: { levelId: number }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#151b40]">
        <Lock className="h-8 w-8 text-slate-500" />
      </div>
      <h2 className="mt-4 text-xl font-black text-white">هذا المستوى مقفل 🔒</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">أكمل المستوى {levelId - 1} أولاً لفتحه</p>
      <Link href="/" className="btn-3d-slate mt-5 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white">
        <ArrowRight className="h-4 w-4" /> عودة للخريطة
      </Link>
    </div>
  );
}
