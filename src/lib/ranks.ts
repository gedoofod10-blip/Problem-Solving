export interface Rank {
  id: string;
  title: string;
  minXp: number;
  icon: string;
  color: string;
  description: string;
}

export const RANKS: Rank[] = [
  { id: "seed", title: "بذرة المنطق", minXp: 0, icon: "sprout", color: "#94a3b8", description: "بداية رحلة التفكير الحاسوبي" },
  { id: "explorer", title: "مستكشف الخوارزميات", minXp: 100, icon: "compass", color: "#22d3ee", description: "تخطيت أولى العتبات بنجاح" },
  { id: "analyst", title: "محلل منطقي", minXp: 250, icon: "brain", color: "#a78bfa", description: "عقلك بدأ يفكر كالحاسوب" },
  { id: "engineer", title: "مهندس التفكير", minXp: 450, icon: "cog", color: "#4ade80", description: "تبني حلولاً منهجية للمشاكل" },
  { id: "master", title: "سيد الحلقات", minXp: 700, icon: "infinity", color: "#f472b6", description: "تروّض التكرار والشروط المعقدة" },
  { id: "mind", title: "العقل الخوارزمي", minXp: 1000, icon: "crown", color: "#ffc93c", description: "قمة الهرم — تفكير حاسوبي كامل" },
];

export function getRankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function getNextRank(xp: number): Rank | null {
  for (const r of RANKS) {
    if (xp < r.minXp) return r;
  }
  return null;
}

export function rankProgress(xp: number): { current: Rank; next: Rank | null; pct: number } {
  const current = getRankForXp(xp);
  const next = getNextRank(xp);
  if (!next) return { current, next: null, pct: 100 };
  const span = next.minXp - current.minXp;
  const done = xp - current.minXp;
  return { current, next, pct: Math.min(100, Math.round((done / span) * 100)) };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (s: { xp: number; completed: number[]; streak: number; perfectLevels: number; totalCorrect: number }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "الخطوة الأولى", description: "أكمل المستوى الأول", icon: "footprints", condition: (s) => s.completed.length >= 1 },
  { id: "scholar", title: "الباحث", description: "اجمع 100 نقطة خبرة", icon: "star", condition: (s) => s.xp >= 100 },
  { id: "chapter-one", title: "سيد الذاكرة", description: "أكمل الفصل الأول كاملاً", icon: "box", condition: (s) => [1, 2, 3].every((l) => s.completed.includes(l)) },
  { id: "logician", title: "المنطقي", description: "أكمل الفصل الثاني كاملاً", icon: "git-fork", condition: (s) => [4, 5, 6].every((l) => s.completed.includes(l)) },
  { id: "looper", title: "مروّض الحلقات", description: "أكمل الفصل الثالث كاملاً", icon: "repeat", condition: (s) => [7, 8, 9].every((l) => s.completed.includes(l)) },
  { id: "sorter", title: "مرتّب البيانات", description: "أكمل الفصل الرابع كاملاً", icon: "layers", condition: (s) => [10, 11, 12].every((l) => s.completed.includes(l)) },
  { id: "perfect", title: "الكمال", description: "أنهِ مستوى بعلامة كاملة (5/5)", icon: "gem", condition: (s) => s.perfectLevels >= 1 },
  { id: "perfect-x3", title: "المثالي", description: "أنهِ 3 مستويات بعلامة كاملة", icon: "crown", condition: (s) => s.perfectLevels >= 3 },
  { id: "streak-3", title: "الشعلة", description: "حافظ على سلسلة 3 أيام", icon: "flame", condition: (s) => s.streak >= 3 },
  { id: "streak-7", title: "البركان", description: "حافظ على سلسلة 7 أيام", icon: "zap", condition: (s) => s.streak >= 7 },
  { id: "marathon", title: "الماراثون", description: "أجب عن 25 سؤالاً إجابة صحيحة", icon: "target", condition: (s) => s.totalCorrect >= 25 },
  { id: "grandmaster", title: "العقل الخوارزمي", description: "أكمل جميع المستويات الـ 12", icon: "trophy", condition: (s) => s.completed.length >= 12 },
];

export const SUCCESS_MESSAGES = [
  "مذهل! عقلك يعمل كالحاسوب",
  "إجابة عبقرية! استمر",
  "أحسنت! منطق سليم تماماً",
  "رائع! أنت تفكر كمهندس",
  "صحيح! الخوارزمي يفتخر بك",
  "عقلية تحليلية ممتازة!",
];

export const FAIL_MESSAGES = [
  "لا بأس! الخطأ أول طريق الإتقان",
  "محاولة جيدة! راجع المنطق",
  "قريب! المفاهيم العظيمة تحتاج وقتاً",
  "لا تستسلم! حتى الحواسيب تخطئ",
  "خطوة للخلف وقفزتان للأمام!",
];

export function randomOf(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
