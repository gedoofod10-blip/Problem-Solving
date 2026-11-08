"use client";

import { motion } from "framer-motion";
import { Flame, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { getRankForXp } from "@/lib/ranks";

export default function Header() {
  const { state, isLoaded } = useProgress();
  const rank = getRankForXp(state.xp);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <motion.div
            className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-[0_0_24px_rgba(74,222,128,0.45)]"
            whileTap={{ scale: 0.9, rotate: -8 }}
          >
            <span className="text-xl font-black text-[#04120a]">خ</span>
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-sm font-black leading-tight text-white">العقل الخوارزمي</p>
            <p className="text-[11px] font-semibold text-slate-400">{rank.title}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <motion.div
            className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5"
            initial={false}
            animate={isLoaded ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.4 }}
            title="سلسلة الأيام النشطة"
          >
            <Flame className={`h-4 w-4 ${state.streak > 0 ? "fill-orange-500 text-orange-400" : "text-slate-500"}`} />
            <span className="tabular text-sm font-black text-orange-300">{state.streak}</span>
          </motion.div>

          <motion.div
            className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5"
            key={state.xp}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            title="نقاط الخبرة"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-300" />
            <span className="tabular text-sm font-black text-amber-300">{state.xp}</span>
          </motion.div>

          <Link href="/achievements" className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:border-amber-400/40" title={rank.title}>
            <Trophy className="h-4 w-4" style={{ color: rank.color }} />
            <span className="hidden text-xs font-black min-[400px]:block" style={{ color: rank.color }}>
              {rank.title}
            </span>
          </Link>
        </div>
      </div>
      {/* daily goal bar */}
      <div className="mx-auto max-w-2xl px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">هدف اليوم {Math.min(state.dailyXp, 50)}/50</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-amber-300 to-orange-500"
              initial={false}
              animate={{ width: `${Math.min(100, (state.dailyXp / 50) * 100)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
