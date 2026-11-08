"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, ArrowRight, Play, Clock, Star, ListChecks } from "lucide-react";
import type { Level } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { LevelIcon } from "@/components/icons";
import QuizEngine from "@/components/QuizEngine";

export default function QuizGate({ level, chapterTitle, chapterColor }: { level: Level; chapterTitle: string; chapterColor: string }) {
  const { isUnlocked, isLoaded } = useProgress();
  const [started, setStarted] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-10 w-10 rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />
      </div>
    );
  }

  if (!isUnlocked(level.id)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-[#151b40] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <Lock className="h-8 w-8 text-slate-500" />
        </motion.div>
        <h2 className="mt-4 text-xl font-black text-white">هذا المستوى مقفل 🔒</h2>
        <p className="mt-1 text-sm font-semibold text-slate-400">أكمل المستوى {level.id - 1} أولاً لفتحه</p>
        <Link href="/" className="btn-3d-slate mt-5 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white">
          <ArrowRight className="h-4 w-4" /> عودة للخريطة
        </Link>
      </div>
    );
  }

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-4">
        <div className="card-duo overflow-hidden rounded-3xl">
          <div className="relative p-6 pb-5" style={{ background: `linear-gradient(140deg, ${chapterColor}33, transparent 70%)` }}>
            <p className="text-xs font-black" style={{ color: chapterColor }}>{chapterTitle}</p>
            <div className="mt-3 flex items-start gap-4">
              <motion.div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl"
                style={{ background: `linear-gradient(160deg, ${chapterColor}, #0d1330)`, boxShadow: `0 0 30px ${chapterColor}55` }}
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <LevelIcon name={level.icon} className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-black text-slate-400">المستوى {level.id}</p>
                <h1 className="text-2xl font-black text-white">{level.title}</h1>
                <p className="mt-0.5 text-sm font-bold" style={{ color: chapterColor }}>{level.subtitle}</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-slate-300">{level.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/5 p-3 text-center">
              <ListChecks className="mx-auto h-4 w-4 text-cyan-300" />
              <p className="tabular mt-1 text-lg font-black text-white">{level.questions.length}</p>
              <p className="text-[10px] font-black text-slate-400">أسئلة</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 text-center">
              <Clock className="mx-auto h-4 w-4 text-violet-300" />
              <p className="tabular mt-1 text-lg font-black text-white">~{level.estimatedMinutes}</p>
              <p className="text-[10px] font-black text-slate-400">دقائق</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 text-center">
              <Star className="mx-auto h-4 w-4 fill-amber-400 text-amber-300" />
              <p className="tabular mt-1 text-lg font-black text-amber-300">+{level.xpReward}</p>
              <p className="text-[10px] font-black text-slate-400">XP مكافأة</p>
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="mb-3 rounded-2xl border border-rose-400/25 bg-rose-400/8 p-3 text-xs font-bold leading-relaxed text-rose-200" style={{ background: "rgba(255,107,107,0.08)" }}>
              ❤️ لديك 3 قلوب — كل إجابة خاطئة تفقدك قلباً. أجب عن 60% على الأقل لاجتياز المستوى وفتح التالي!
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStarted(true)} className="btn-3d-green flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black text-emerald-950">
              <Play className="h-5 w-5 fill-emerald-950" /> ابدأ التحدي
            </motion.button>
            <Link href="/" className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-slate-400 transition hover:text-white">
              <ArrowRight className="h-4 w-4" /> عودة للخريطة
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return <QuizEngine level={level} />;
}
