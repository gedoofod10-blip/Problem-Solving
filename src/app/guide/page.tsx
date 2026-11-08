"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Box, GitFork, Repeat, Layers, Lightbulb } from "lucide-react";
import { CHAPTERS } from "@/data/curriculum";

const GUIDE_CONTENT: Record<number, { concept: string; points: string[]; example: string }[]> = {
  1: [
    {
      concept: "ما هو المتغير؟",
      points: [
        "المتغير صندوق مسمّى في الذاكرة يخزّن قيمة واحدة في كل لحظة.",
        "الاسم ثابت (لافتة الصندوق) لكن المحتوى يتغير — لهذا سُمّي متغيراً.",
        "تخزين قيمة جديدة يمسح القديمة تماماً.",
      ],
      example: "مثال: «النقاط = 0» ثم «النقاط = 10» ← القيمة الآن 10 وليست 0.",
    },
    {
      concept: "النسخ مقابل التبديل",
      points: [
        "الأمر «ب = أ» ينسخ قيمة (أ) إلى (ب) دون أن يمسح (أ).",
        "لتبديل صندوقين تحتاج صندوقاً ثالثاً مؤقتاً (مثل كوب فارغ).",
        "القيم المنسية (الممسوحة) لا يمكن استرجاعها!",
      ],
      example: "مثال: أ=10، ب=20 ← «أ = ب» ← أ=20، ب=20 (ضاعت الـ 10).",
    },
    {
      concept: "تتبع الحالة",
      points: [
        "نفّذ سطراً واحداً في كل مرة وحدّث القيم على ورقة.",
        "«س = س + 2» تعني: خذ القيمة الحالية، أضف 2، وخزّن الناتج.",
        "ترتيب العمليات يغيّر النتيجة — لا تقفز للنهاية!",
      ],
      example: "مثال: س=5 ← س=س+2 (يصبح 7) ← س=س×2 (يصبح 14).",
    },
  ],
  2: [
    {
      concept: "إذا / وإلا (If / Else)",
      points: [
        "يُفحص الشرط: إذا كان صحيحاً ننفّذ فرع «إذا»، وإلا فرع «وإلا».",
        "يُنفَّذ فرع واحد فقط دائماً — أبداً الاثنان معاً.",
        "انتبه للفرق بين > (أكبر من) و >= (أكبر من أو يساوي).",
      ],
      example: "مثال: إذا الحرارة > 30 ← مكيف، وإلا ← مدفأة. حرارة 30 = مدفأة!",
    },
    {
      concept: "البوابات: AND و OR و NOT",
      points: [
        "AND (و): صارمة — تتطلب تحقق جميع الشروط.",
        "OR (أو): كريمة — يكفي شرط واحد متحقق.",
        "NOT (ليس): تعكس القيمة — تقلب الصحيح لخاطئ والعكس.",
      ],
      example: "مثال: (صحيح AND خاطئ) = خاطئ، لكن (صحيح OR خاطئ) = صحيح.",
    },
    {
      concept: "الشروط المركبة وجداول الحقيقة",
      points: [
        "ما داخل الأقواس يُقيَّم أولاً دائماً.",
        "بدون أقواس: NOT أولاً، ثم AND، ثم OR أخيراً.",
        "جدول الحقيقة لمتغيرين = 4 سطور (2²)، ولثلاثة = 8 سطور (2³).",
      ],
      example: "مثال: (أ OR ب) AND (NOT ب) ← احسب القوسين أولاً ثم اجمع.",
    },
  ],
  3: [
    {
      concept: "ما هي الحلقة؟",
      points: [
        "الحلقة تكرر مجموعة أوامر عدداً محدداً من المرات.",
        "بدل كتابة الأمر 100 مرة، اكتبه مرة وكرره بحلقة.",
        "كل تكرار يُسمى «دورة» (Iteration).",
      ],
      example: "مثال: كرر 4 مرات: اخطُ 3 خطوات ← المجموع 12 خطوة.",
    },
    {
      concept: "العدّاد والمجموع التراكمي",
      points: [
        "العدّاد متغير يحصي الدورات (يزيد 1 كل مرة عادة).",
        "المجموع التراكمي يبدأ من 0 ويُضاف إليه في كل دورة.",
        "انتبه: حلقة من 1 إلى 5 تنفّذ 5 مرات، ومن 0 إلى 5 تنفّذ 6!",
      ],
      example: "مثال: مجموع=0، كرر i من 1 إلى 4: مجموع+=i ← الناتج 10.",
    },
    {
      concept: "التداخل وشروط التوقف",
      points: [
        "حلقة داخل حلقة: الإجمالي = الخارجية × الداخلية.",
        "حلقة «بينما» تحتاج شرط توقف يتحقق يوماً ما.",
        "بدون شرط توقف ← حلقة لانهائية ← تجمّد البرنامج!",
      ],
      example: "مثال: خارجية 3 × داخلية 2 = 6 تنفيذات لما في الداخل.",
    },
  ],
  4: [
    {
      concept: "القوائم والفهارس",
      points: [
        "القائمة صف من الصناديق المرقمة بفهارس.",
        "الفهارس تبدأ من 0! أول عنصر فهرسه 0.",
        "آخر فهرس = الطول − 1. العنصر رقم n فهرسه n−1.",
      ],
      example: "مثال: [90، 85، 78] ← الفهرس 0 هو 90، والفهرس 2 هو 78.",
    },
    {
      concept: "البحث: الخطي مقابل الثنائي",
      points: [
        "البحث الخطي: تفحّص من البداية حتى تجد — بطيء (حتى n خطوة).",
        "البحث الثنائي: قارن بالمنتصف واستبعد نصفاً — سريع (~log خطوة).",
        "شرط البحث الثنائي: القائمة مرتبة!",
      ],
      example: "مثال: 1000 عنصر ← الخطي قد يحتاج 1000، الثنائي ~10 فقط!",
    },
    {
      concept: "الترتيب واستراتيجية فرّق تسُد",
      points: [
        "الترتيب التصاعدي: من الأصغر للأكبر.",
        "«فرّق تسُد»: قسّم المشكلة الكبيرة لأجزاء صغيرة وحلّها.",
        "كل المفاهيم تجتمع في البرامج الحقيقية: متغيرات + شروط + حلقات + قوائم.",
      ],
      example: "مثال: [3،1،2] تصاعدياً = [1،2،3]. والبحث الثنائي يطبق فرّق تسُد.",
    },
  ],
};

const CHAPTER_ICONS: Record<number, typeof Box> = { 1: Box, 2: GitFork, 3: Repeat, 4: Layers };

export default function GuidePage() {
  const [openChapter, setOpenChapter] = useState<number>(1);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card-duo mb-5 rounded-3xl p-5">
        <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
          <Lightbulb className="h-4 w-4" /> مرجع المفاهيم
        </div>
        <h1 className="mt-1.5 text-2xl font-black text-white">دليل العقل الخوارزمي 📚</h1>
        <p className="mt-1 text-[13px] font-semibold leading-relaxed text-slate-300">
          كل المفاهيم مشروحة بأمثلة من الحياة اليومية — بدون سطر كود واحد. راجعها قبل التحديات!
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {CHAPTERS.map((ch) => {
          const Icon = CHAPTER_ICONS[ch.id] ?? Box;
          const open = openChapter === ch.id;
          return (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ch.id * 0.06 }} className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1330]/80">
              <button onClick={() => setOpenChapter(open ? 0 : ch.id)} className="flex w-full items-center gap-3 p-4 text-right">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${ch.color}22`, border: `1px solid ${ch.color}55` }}>
                  <Icon className="h-5 w-5" style={{ color: ch.color }} />
                </span>
                <span className="flex-1">
                  <span className="block text-[11px] font-black" style={{ color: ch.color }}>الفصل {ch.id}</span>
                  <span className="block text-base font-black text-white">{ch.title}</span>
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }}>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 28 }} className="overflow-hidden">
                    <div className="flex flex-col gap-3 border-t border-white/10 p-4">
                      {GUIDE_CONTENT[ch.id].map((g, i) => (
                        <div key={i} className="rounded-2xl bg-white/[0.04] p-4">
                          <h3 className="text-sm font-black text-white">📌 {g.concept}</h3>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {g.points.map((p, j) => (
                              <li key={j} className="flex items-start gap-2 text-[12.5px] font-semibold leading-relaxed text-slate-300">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ch.color }} />
                                {p}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2.5 rounded-xl border border-white/10 bg-black/30 p-2.5 text-[12px] font-bold leading-relaxed text-emerald-200">{g.example}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
