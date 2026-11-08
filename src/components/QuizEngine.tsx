"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Heart, Check, Lightbulb, ArrowLeft, RotateCcw, Home, Trophy, Sparkles, Keyboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Level, Question } from "@/data/curriculum";
import { checkTextAnswer, xpForDifficulty, getLevel } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { FAIL_MESSAGES, SUCCESS_MESSAGES, randomOf } from "@/lib/ranks";

function fireConfetti(big = false) {
  const defaults = { origin: { y: 0.6 }, zIndex: 9999, disableForReducedMotion: true };
  if (big) {
    confetti({ ...defaults, particleCount: 160, spread: 100, colors: ["#4ade80", "#ffc93c", "#22d3ee", "#a78bfa", "#ffffff"] });
    setTimeout(() => confetti({ ...defaults, particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
    setTimeout(() => confetti({ ...defaults, particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 350);
  } else {
    confetti({ ...defaults, particleCount: 45, spread: 70, scalar: 0.9, colors: ["#4ade80", "#22d3ee", "#ffffff"] });
  }
}

type Phase = "answering" | "feedback" | "complete" | "failed";

export default function QuizEngine({ level }: { level: Level }) {
  const router = useRouter();
  const { completeLevel, recordAnswer, state } = useProgress();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [textValue, setTextValue] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [streakBonus, setStreakBonus] = useState(0);
  const [answerStreak, setAnswerStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = level.questions;
  const q: Question = questions[index];
  const progress = ((index + (phase === "answering" ? 0 : 0)) / questions.length) * 100;

  const options = useMemo(() => q.options ?? [], [q]);

  const canCheck = q.type === "text" ? textValue.trim().length > 0 : selected !== null;

  function handleCheck() {
    if (!canCheck || phase !== "answering") return;
    let correct = false;
    if (q.type === "text") {
      correct = checkTextAnswer(textValue, q);
    } else {
      correct = selected === q.correctAnswer;
    }
    setWasCorrect(correct);
    recordAnswer(correct);
    setFeedbackMsg(correct ? randomOf(SUCCESS_MESSAGES) : randomOf(FAIL_MESSAGES));
    if (correct) {
      const base = xpForDifficulty(q.difficulty);
      const newStreak = answerStreak + 1;
      setAnswerStreak(newStreak);
      const bonus = newStreak >= 3 ? 5 : 0;
      setStreakBonus((s) => s + bonus);
      setEarnedXp((e) => e + base + bonus);
      setCorrectCount((c) => c + 1);
      fireConfetti(false);
    } else {
      setAnswerStreak(0);
      const remaining = hearts - 1;
      setHearts(remaining);
      if (remaining <= 0) {
        // will show failed after feedback dismissed
      }
    }
    setPhase("feedback");
  }

  function handleNext() {
    if (hearts <= 0 && !wasCorrect) {
      setPhase("failed");
      return;
    }
    if (index + 1 >= questions.length) {
      const passed = correctCount / questions.length >= 0.6;
      const perfectBonus = correctCount === questions.length ? 20 : 0;
      const total = earnedXp + (passed ? level.xpReward / 2 : 0) + perfectBonus;
      completeLevel(level.id, correctCount, questions.length, Math.round(total));
      // record attempt on server
      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: state.userId, levelId: level.id, score: correctCount, total: questions.length, xpEarned: Math.round(total), passed }),
      }).catch(() => {});
      setPhase("complete");
      if (passed) {
        setTimeout(() => fireConfetti(true), 350);
      }
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTextValue("");
      setShowHint(false);
      setPhase("answering");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }

  function handleRetry() {
    setIndex(0);
    setSelected(null);
    setTextValue("");
    setPhase("answering");
    setHearts(3);
    setCorrectCount(0);
    setEarnedXp(0);
    setAnswerStreak(0);
    setStreakBonus(0);
    setShowHint(false);
  }

  const passed = correctCount / questions.length >= 0.6;
  const stars = correctCount === questions.length ? 3 : correctCount >= questions.length - 1 ? 2 : passed ? 1 : 0;
  const nextLevel = getLevel(level.id + 1);

  // ─── COMPLETE SCREEN ───
  if (phase === "complete") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className={`grid h-28 w-28 place-items-center rounded-full ${passed ? "bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_0_60px_rgba(255,201,60,0.5)]" : "bg-[#1b2150]"}`}
        >
          <Trophy className={`h-12 w-12 ${passed ? "text-amber-950" : "text-slate-500"}`} />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={`mt-5 text-2xl font-black ${passed ? "text-glow-gold text-amber-300" : "text-slate-300"}`}>
          {passed ? (stars === 3 ? "أداء أسطوري! 🏆" : "أحسنت! تجاوزت المستوى") : "لم تنجح هذه المرة"}
        </motion.h2>
        <p className="mt-1 text-sm font-bold text-slate-400">
          {passed ? `حصلت على ${correctCount} من ${questions.length} — رائع يا بطل المنطق!` : `نتيجتك ${correctCount} من ${questions.length} — تحتاج 60% على الأقل للنجاح`}
        </p>

        {passed && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-4 flex items-center gap-1.5">
            {[1, 2, 3].map((s, i) => (
              <motion.span key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5 + i * 0.18, type: "spring", stiffness: 260, damping: 12 }}>
                <Star2 filled={s <= stars} />
              </motion.span>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="card-duo mt-5 grid w-full max-w-sm grid-cols-3 gap-2 rounded-3xl p-4">
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-[11px] font-black text-slate-400">النقاط</p>
            <p className="tabular text-xl font-black text-emerald-300">{correctCount}/{questions.length}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-[11px] font-black text-slate-400">XP مكتسبة</p>
            <p className="tabular text-xl font-black text-amber-300">+{Math.round(earnedXp + (passed ? level.xpReward / 2 : 0) + (stars === 3 ? 20 : 0))}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-[11px] font-black text-slate-400">الدقة</p>
            <p className="tabular text-xl font-black text-cyan-300">{Math.round((correctCount / questions.length) * 100)}%</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
          {passed && nextLevel && (
            <Link href={`/level/${nextLevel.id}`} className="btn-3d-green flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-emerald-950">
              المستوى التالي: {nextLevel.title}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="flex gap-2.5">
            <button onClick={handleRetry} className="btn-3d-slate flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white">
              <RotateCcw className="h-4 w-4" /> إعادة المحاولة
            </button>
            <Link href="/" className="btn-3d-slate flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white">
              <Home className="h-4 w-4" /> الخريطة
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ─── FAILED (no hearts) ───
  if (phase === "failed") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="grid h-24 w-24 place-items-center rounded-full bg-[#2a1430] shadow-[0_0_50px_rgba(255,107,107,0.3)]"
        >
          <Heart className="h-10 w-10 fill-rose-500/30 text-rose-400" />
        </motion.div>
        <h2 className="mt-5 text-2xl font-black text-rose-300">نفدت القلوب! 💔</h2>
        <p className="mt-2 max-w-xs text-sm font-semibold leading-relaxed text-slate-400">
          لا تقلق — كل عبقري مرّ بهذا. راجع الشروحات في الأسفل وحاول مجدداً، المفاهيم ستترسخ أكثر!
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
          <button onClick={handleRetry} className="btn-3d-green flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-emerald-950">
            <RotateCcw className="h-4 w-4" /> حاول مجدداً
          </button>
          <Link href="/" className="btn-3d-slate flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white">
            <Home className="h-4 w-4" /> عودة للخريطة
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col pb-40">
      {/* top bar */}
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="خروج">
          <X className="h-5 w-5" />
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400"
            initial={false}
            animate={{ width: `${(index / questions.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="flex items-center gap-1" title="القلوب المتبقية">
          <Heart className={`h-5 w-5 ${hearts > 0 ? "fill-rose-500 text-rose-400" : "text-slate-600"}`} />
          <span className="tabular text-sm font-black text-rose-300">{hearts}</span>
        </div>
      </div>

      {/* meta */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-black text-slate-300" style={{ background: "rgba(255,255,255,0.08)" }}>
          سؤال {index + 1} من {questions.length}
        </span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-black ${q.difficulty === "سهل" ? "bg-emerald-400/15 text-emerald-300" : q.difficulty === "متوسط" ? "bg-amber-400/15 text-amber-300" : "bg-rose-400/15 text-rose-300"}`}>
          {q.difficulty} • +{xpForDifficulty(q.difficulty)} XP
        </span>
        {answerStreak >= 2 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-[11px] font-black text-orange-300">
            🔥 سلسلة {answerStreak}
          </motion.span>
        )}
      </div>

      {/* question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        >
          <div className="card-duo rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_0_20px_rgba(167,139,250,0.4)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="flex-1 text-[15px] font-bold leading-[1.9] text-white">{q.question}</p>
            </div>
            {q.hint && (
              <div className="mt-3">
                <button onClick={() => setShowHint((s) => !s)} className="flex items-center gap-1.5 text-xs font-black text-cyan-300 transition hover:text-cyan-200">
                  <Lightbulb className="h-4 w-4" /> {showHint ? "إخفاء التلميح" : "عرض تلميح"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-xs font-semibold leading-relaxed text-cyan-200/90">
                      <span className="mt-2 block rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-3">💡 {q.hint}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* answers */}
          <div className="mt-4 flex flex-col gap-2.5">
            {q.type === "text" ? (
              <div className="card-duo rounded-3xl p-4">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-black text-slate-300">
                  <Keyboard className="h-4 w-4" /> اكتب إجابتك هنا
                </label>
                <input
                  ref={inputRef}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCheck(); }}
                  placeholder="مثال: 8 أو صحيح..."
                  disabled={phase === "feedback"}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-center text-lg font-black text-white placeholder:text-slate-600 focus:border-emerald-400/60"
                />
                <p className="mt-2 text-center text-[11px] font-bold text-slate-500">الأرقام العربية والإنجليزية كلها مقبولة</p>
              </div>
            ) : (
              options.map((opt, i) => {
                const isSel = selected === opt;
                const showResult = phase === "feedback";
                const isCorrectOpt = opt === q.correctAnswer;
                let cls = "border-white/12 bg-white/[0.04] hover:border-cyan-300/50 hover:bg-cyan-400/10";
                if (showResult && isCorrectOpt) cls = "border-emerald-400 bg-emerald-400/15 shadow-[0_0_24px_rgba(74,222,128,0.25)]";
                else if (showResult && isSel && !isCorrectOpt) cls = "border-rose-400 bg-rose-400/15 shadow-[0_0_24px_rgba(255,107,107,0.25)]";
                else if (isSel) cls = "border-cyan-300 bg-cyan-400/15 shadow-[0_0_24px_rgba(34,211,238,0.3)]";
                return (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={showResult ? {} : { scale: 0.97 }}
                    onClick={() => !showResult && setSelected(opt)}
                    disabled={showResult}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-right transition-all ${cls}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black ${showResult && isCorrectOpt ? "bg-emerald-400 text-emerald-950" : showResult && isSel ? "bg-rose-400 text-rose-950" : isSel ? "bg-cyan-300 text-cyan-950" : "bg-white/10 text-slate-300"}`}>
                      {showResult && isCorrectOpt ? <Check className="h-4 w-4" strokeWidth={3.5} /> : showResult && isSel ? <X className="h-4 w-4" strokeWidth={3.5} /> : ["أ", "ب", "ج", "د"][i] ?? (i + 1)}
                    </span>
                    <span className="flex-1 text-[15px] font-black leading-relaxed text-white">{opt}</span>
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* check button */}
      {phase === "answering" && (
        <div className="fixed inset-x-0 bottom-[68px] z-30 border-t border-white/10 bg-[#05070f]/90 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCheck}
              disabled={!canCheck}
              className={`w-full rounded-2xl px-6 py-3.5 text-base font-black ${canCheck ? "btn-3d-green text-emerald-950" : "cursor-not-allowed bg-white/10 text-slate-500"}`}
            >
              تحقق من الإجابة
            </motion.button>
          </div>
        </div>
      )}

      {/* feedback bottom sheet */}
      <AnimatePresence>
        {phase === "feedback" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={handleNext} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t-2 p-5 pb-8 ${wasCorrect ? "border-emerald-400/50 bg-gradient-to-b from-[#0c2b1d] to-[#07130d]" : "border-rose-400/50 bg-gradient-to-b from-[#2b0f1a] to-[#130710]"}`}
            >
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${wasCorrect ? "bg-emerald-400 shadow-[0_0_30px_rgba(74,222,128,0.6)]" : "bg-rose-400 shadow-[0_0_30px_rgba(255,107,107,0.6)]"}`}
                  >
                    {wasCorrect ? <Check className="h-7 w-7 text-emerald-950" strokeWidth={3.5} /> : <X className="h-7 w-7 text-rose-950" strokeWidth={3.5} />}
                  </motion.div>
                  <div>
                    <h3 className={`text-lg font-black ${wasCorrect ? "text-emerald-300" : "text-rose-300"}`}>{feedbackMsg}</h3>
                    {wasCorrect ? (
                      <p className="text-sm font-black text-amber-300">+{xpForDifficulty(q.difficulty) + (answerStreak >= 3 ? 5 : 0)} XP {answerStreak >= 3 && "🔥 مكافأة السلسلة!"}</p>
                    ) : (
                      <p className="text-sm font-bold text-slate-300">
                        الإجابة الصحيحة: <span className="font-black text-emerald-300">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className={`mt-3 rounded-2xl border p-4 ${wasCorrect ? "border-emerald-400/25 bg-emerald-400/8" : "border-white/10 bg-white/[0.05]"}`} style={wasCorrect ? { background: "rgba(74,222,128,0.08)" } : {}}>
                  <p className="mb-1 text-[11px] font-black tracking-wide text-slate-400">💡 الشرح المنطقي</p>
                  <p className="text-[13.5px] font-semibold leading-[1.9] text-slate-100">{q.explanation}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className={`mt-4 w-full rounded-2xl px-6 py-3.5 text-base font-black ${wasCorrect ? "btn-3d-green text-emerald-950" : "btn-3d-gold text-amber-950"}`}
                >
                  {index + 1 >= questions.length ? "عرض النتيجة" : "تابع"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Star2({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-10 w-10 ${filled ? "fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(255,201,60,0.7)]" : "fill-slate-700 text-slate-600"}`}>
      <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
    </svg>
  );
}
