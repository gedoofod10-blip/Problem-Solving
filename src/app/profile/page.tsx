"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Star, Target, RotateCcw, User, CheckCircle2, Zap, Calendar } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { rankProgress } from "@/lib/ranks";
import { LEVELS, TOTAL_QUESTIONS } from "@/data/curriculum";
import { LevelIcon } from "@/components/icons";

export default function ProfilePage() {
  const { state, resetProgress } = useProgress();
  const { current, next, pct } = rankProgress(state.xp);
  const [confirmReset, setConfirmReset] = useState(false);
  const accuracy = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card-duo mb-4 overflow-hidden rounded-3xl p-6 text-center">
        <motion.div
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-[0_0_40px_rgba(167,139,250,0.5)]"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          <User className="h-9 w-9 text-white" />
        </motion.div>
        <h1 className="mt-3 text-xl font-black text-white">بطل المنطق 🧠</h1>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black" style={{ background: `${current.color}22`, color: current.color, border: `1px solid ${current.color}55` }}>
          <LevelIcon name={current.icon} className="h-4 w-4" />
          {current.title}
        </div>
        <div className="mx-auto mt-4 max-w-xs">
          <div className="mb-1.5 flex justify-between text-[11px] font-black text-slate-400">
            <span>التقدم للرتبة التالية</span>
            <span className="tabular">{next ? `${state.xp}/${next.minXp} XP` : "القمة!"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-l from-violet-400 to-fuchsia-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 80, damping: 20 }} />
          </div>
          {next && <p className="mt-1.5 text-[11px] font-bold text-slate-500">متبقٍ {next.minXp - state.xp} XP لرتبة «{next.title}»</p>}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: Star, label: "مجموع XP", value: String(state.xp), color: "#ffc93c" },
          { icon: Flame, label: "سلسلة الأيام", value: `${state.streak} يوم`, color: "#fb923c" },
          { icon: CheckCircle2, label: "مستويات مكتملة", value: `${state.completedLevels.length}/${LEVELS.length}`, color: "#4ade80" },
          { icon: Target, label: "الدقة", value: `${accuracy}%`, color: "#22d3ee" },
          { icon: Zap, label: "إجابات صحيحة", value: `${state.totalCorrect}/${TOTAL_QUESTIONS}`, color: "#a78bfa" },
          { icon: Calendar, label: "XP اليوم", value: `${state.dailyXp}`, color: "#f472b6" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card-duo rounded-3xl p-4">
            <s.icon className="h-5 w-5" style={{ color: s.color }} />
            <p className="tabular mt-2 text-xl font-black text-white">{s.value}</p>
            <p className="text-[11px] font-black text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-black text-white">⚙️ إعدادات البيانات</h3>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">
          يتم حفظ تقدمك تلقائياً في متصفحك (localStorage) ومزامنته مع الخادم. يمكنك إعادة تعيين كل شيء والبدء من جديد.
        </p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm font-black text-rose-300 transition hover:bg-rose-400/20">
            <RotateCcw className="h-4 w-4" /> إعادة تعيين التقدم
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={() => { resetProgress(); setConfirmReset(false); }} className="flex-1 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-black text-white">
              تأكيد المسح
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-3d-slate flex-1 rounded-2xl px-4 py-2.5 text-sm font-black text-white">
              تراجع
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
