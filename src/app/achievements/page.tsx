"use client";

import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { ACHIEVEMENTS, RANKS, getRankForXp } from "@/lib/ranks";
import { LevelIcon } from "@/components/icons";

export default function AchievementsPage() {
  const { state } = useProgress();
  const rank = getRankForXp(state.xp);
  const stats = {
    xp: state.xp,
    completed: state.completedLevels,
    streak: state.streak,
    perfectLevels: state.perfectLevels.length,
    totalCorrect: state.totalCorrect,
  };
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.condition(stats)).length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card-duo mb-5 overflow-hidden rounded-3xl p-5">
        <div className="flex items-center gap-2 text-xs font-black text-amber-300">
          <Award className="h-4 w-4" /> قاعة الشرف
        </div>
        <h1 className="mt-1.5 text-2xl font-black text-white">إنجازاتك 🏅</h1>
        <p className="mt-1 text-[13px] font-semibold text-slate-300">
          فتحت {unlockedCount} من {ACHIEVEMENTS.length} إنجازاً — واصل التقدم!
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-l from-amber-300 to-orange-500" initial={{ width: 0 }} animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }} transition={{ type: "spring", stiffness: 80, damping: 20 }} />
        </div>
      </motion.div>

      {/* ranks ladder */}
      <h2 className="mb-2.5 text-sm font-black text-slate-300">سلّم الرتب 👑</h2>
      <div className="mb-6 flex flex-col gap-2">
        {RANKS.map((r, i) => {
          const achieved = state.xp >= r.minXp;
          const isCurrent = rank.id === r.id;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${isCurrent ? "border-amber-400/50 bg-amber-400/10 shadow-[0_0_24px_rgba(255,201,60,0.15)]" : achieved ? "border-emerald-400/25 bg-white/[0.04]" : "border-white/8 bg-white/[0.02] opacity-60"}`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${r.color}20`, border: `1px solid ${r.color}44` }}>
                <LevelIcon name={r.icon} className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-black" style={{ color: achieved ? r.color : "#64748b" }}>{r.title}</span>
                <span className="block text-[11px] font-bold text-slate-500">{r.description}</span>
              </span>
              <span className="tabular shrink-0 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-black text-slate-300">{r.minXp}+ XP</span>
            </motion.div>
          );
        })}
      </div>

      {/* achievements grid */}
      <h2 className="mb-2.5 text-sm font-black text-slate-300">الأوسمة 🎖️</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = a.condition(stats);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              className={`relative overflow-hidden rounded-3xl border p-4 text-center ${unlocked ? "border-amber-400/40 bg-gradient-to-b from-amber-400/15 to-transparent" : "border-white/8 bg-white/[0.03]"}`}
            >
              {!unlocked && <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />}
              <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${unlocked ? "bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_20px_rgba(255,201,60,0.4)]" : "bg-white/8"}`}>
                <LevelIcon name={a.icon} className={`h-6 w-6 ${unlocked ? "text-amber-950" : "text-slate-600"}`} />
              </div>
              <p className={`mt-2 text-[13px] font-black ${unlocked ? "text-white" : "text-slate-500"}`}>{a.title}</p>
              <p className={`mt-0.5 text-[11px] font-bold leading-relaxed ${unlocked ? "text-slate-300" : "text-slate-600"}`}>{a.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
