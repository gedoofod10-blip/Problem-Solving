"use client";

import { motion } from "framer-motion";
import { Lock, Star, Check, ChevronLeft, Play, BookOpen } from "lucide-react";
import Link from "next/link";
import { CHAPTERS, LEVELS, getChapter } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { LevelIcon } from "./icons";

function LevelNode({ levelId, index }: { levelId: number; index: number }) {
  const level = LEVELS.find((l) => l.id === levelId)!;
  const chapter = getChapter(level.chapterId)!;
  const { isUnlocked, isCompleted, state } = useProgress();
  const unlocked = isUnlocked(levelId);
  const completed = isCompleted(levelId);
  const isNext = unlocked && !completed;
  const result = state.results[levelId];
  const stars = result ? (result.score === result.total ? 3 : result.score >= result.total - 1 ? 2 : 1) : 0;

  // zigzag offset for playful path
  const offsets = [0, -52, 52, -28, 28, 0];
  const x = offsets[index % offsets.length];

  const node = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: 0.05 * (index % 3), type: "spring", stiffness: 200, damping: 22 }}
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${x}px)` }}
    >
      {isNext && (
        <motion.div
          className="absolute -top-11 z-10 whitespace-nowrap rounded-2xl border border-emerald-300/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-black text-emerald-200 backdrop-blur"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          ابدأ من هنا!
          <span className="absolute -bottom-1.5 right-1/2 h-3 w-3 translate-x-1/2 rotate-45 border-b border-l border-emerald-300/40 bg-[#0b2b1d]" />
        </motion.div>
      )}

      <motion.div
        whileTap={unlocked ? { scale: 0.88 } : {}}
        animate={isNext ? { scale: [1, 1.06, 1] } : {}}
        transition={isNext ? { repeat: Infinity, duration: 2 } : {}}
        className="relative"
      >
        {completed ? (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_6px_0_#92610a,0_16px_36px_-8px_rgba(255,201,60,0.6)] ring-4 ring-amber-200/30">
            <LevelIcon name={level.icon} className="h-8 w-8 text-amber-950" />
            <span className="absolute -bottom-1 -left-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-400 shadow ring-2 ring-[#05070f]">
              <Check className="h-4 w-4 text-emerald-950" strokeWidth={3.5} />
            </span>
          </div>
        ) : unlocked ? (
          <div
            className="grid h-20 w-20 place-items-center rounded-full shadow-[0_6px_0_rgba(0,0,0,0.45)] ring-4"
            style={{
              background: `linear-gradient(180deg, ${chapter.color}, #0d1330)`,
              boxShadow: `0 6px 0 rgba(0,0,0,0.5), 0 0 36px ${chapter.color}66`,
              ["--tw-ring-color" as string]: `${chapter.color}55`,
            }}
          >
            <LevelIcon name={level.icon} className="h-8 w-8 text-white drop-shadow" />
          </div>
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#151b40] shadow-[0_6px_0_#0a0e28] ring-4 ring-white/5">
            <Lock className="h-7 w-7 text-slate-600" />
          </div>
        )}
      </motion.div>

      <div className="mt-2 flex flex-col items-center">
        <p className={`text-sm font-black ${unlocked ? "text-white" : "text-slate-600"}`}>
          {levelId}. {level.title}
        </p>
        {completed && (
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star key={s} className={`h-3.5 w-3.5 ${s <= stars ? "fill-amber-400 text-amber-300" : "text-slate-700"}`} />
            ))}
          </div>
        )}
        {!unlocked && <p className="mt-0.5 text-[11px] font-bold text-slate-600">أكمل المستوى {levelId - 1} لفتحه</p>}
      </div>
    </motion.div>
  );

  if (!unlocked) return <div className="flex justify-center py-3">{node}</div>;
  return (
    <Link href={`/level/${levelId}`} className="flex justify-center py-3">
      {node}
    </Link>
  );
}

export default function LevelMap() {
  const { state } = useProgress();
  const completedCount = state.completedLevels.length;
  const totalPct = Math.round((completedCount / LEVELS.length) * 100);

  return (
    <div className="pb-6">
      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-duo relative mb-6 overflow-hidden rounded-3xl p-5"
      >
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute -bottom-12 right-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-black text-cyan-300">
            <BookOpen className="h-3.5 w-3.5" />
            التفكير الحاسوبي بدون كتابة كود
          </div>
          <h1 className="mt-2 text-2xl font-black leading-snug text-white">
            درّب عقلك على <span className="shimmer-text">التفكير الخوارزمي</span>
          </h1>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-slate-300">
            ألغاز منطقية من الحياة اليومية: متغيرات، شروط، حلقات، وقوائم — خطوة بخطوة حتى القمة.
          </p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-300">تقدم الرحلة</span>
              <span className="text-emerald-300 tabular">{completedCount}/{LEVELS.length} مستوى • {totalPct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-emerald-400 via-green-400 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* chapters + levels */}
      {CHAPTERS.map((chapter) => {
        const chapterLevels = LEVELS.filter((l) => l.chapterId === chapter.id);
        const doneInChapter = chapterLevels.filter((l) => state.completedLevels.includes(l.id)).length;
        const chapterUnlocked = chapterLevels.some((l) => state.unlockedLevels.includes(l.id));
        return (
          <section key={chapter.id} className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-3xl border p-4 ${chapterUnlocked ? "" : "opacity-70"}`}
              style={{
                borderColor: `${chapter.color}44`,
                background: `linear-gradient(140deg, ${chapter.color}22, rgba(10,15,36,0.9) 60%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${chapter.color}26`, border: `1px solid ${chapter.color}55` }}
                >
                  <LevelIcon name={chapter.icon} className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black" style={{ color: chapter.color }}>
                    الفصل {chapter.id} • {chapter.englishTitle}
                  </p>
                  <h2 className="truncate text-lg font-black text-white">{chapter.title}</h2>
                </div>
                <div className="shrink-0 rounded-full bg-black/30 px-3 py-1 text-[11px] font-black text-white tabular">
                  {doneInChapter}/{chapterLevels.length}
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-300">{chapter.description}</p>
            </motion.div>

            <div className="relative mt-2">
              <div className="level-path-line absolute inset-y-4 right-1/2 w-1 translate-x-1/2 opacity-60" />
              <div className="relative">
                {chapterLevels.map((level, i) => (
                  <LevelNode key={level.id} levelId={level.id} index={i} />
                ))}
              </div>
            </div>

            {chapter.id < CHAPTERS.length && (
              <div className="mt-2 flex items-center gap-3 px-6 opacity-50">
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-500 to-transparent" />
                <ChevronLeft className="h-4 w-4 rotate-[-90deg] text-slate-400" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-500 to-transparent" />
              </div>
            )}
          </section>
        );
      })}

      {/* continue CTA */}
      {(() => {
        const next = LEVELS.find((l) => state.unlockedLevels.includes(l.id) && !state.completedLevels.includes(l.id));
        if (!next) {
          return (
            <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} className="card-duo rounded-3xl p-6 text-center">
              <p className="text-3xl">👑</p>
              <h3 className="mt-2 text-xl font-black text-amber-300">أنت العقل الخوارزمي!</h3>
              <p className="mt-1 text-sm font-semibold text-slate-300">أكملت جميع المستويات. راجعها للإتقان أو تحدَّ نفسك مجدداً.</p>
              <Link href="/achievements" className="btn-3d-gold mt-4 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-amber-950">
                <Play className="h-4 w-4" /> عرض إنجازاتي
              </Link>
            </motion.div>
          );
        }
        return (
          <Link href={`/level/${next.id}`} className="btn-3d-green flex items-center justify-center gap-2 rounded-3xl px-6 py-4 text-base font-black text-emerald-950">
            <Play className="h-5 w-5 fill-emerald-950" />
            تابع: المستوى {next.id} — {next.title}
          </Link>
        );
      })()}
    </div>
  );
}
