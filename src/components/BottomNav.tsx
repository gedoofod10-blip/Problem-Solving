"use client";

import { motion } from "framer-motion";
import { Home, BookOpen, Award, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "الخريطة", icon: Home },
  { href: "/guide", label: "الدليل", icon: BookOpen },
  { href: "/achievements", label: "الإنجازات", icon: Award },
  { href: "/profile", label: "حسابي", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b18]/92 backdrop-blur-xl" style={{ background: "rgba(7,11,24,0.92)" }}>
      <div className="mx-auto grid max-w-2xl grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 py-2.5">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute -top-px h-1 w-12 rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"
                />
              )}
              <motion.span whileTap={{ scale: 0.8 }} className={`grid h-9 w-9 place-items-center rounded-2xl transition ${active ? "bg-emerald-400/15 text-emerald-300" : "text-slate-500"}`}>
                <Icon className="h-5 w-5" />
              </motion.span>
              <span className={`text-[11px] font-black ${active ? "text-emerald-300" : "text-slate-500"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
