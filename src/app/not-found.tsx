import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#151b40]">
        <Compass className="h-9 w-9 text-violet-300" />
      </div>
      <h1 className="mt-4 text-5xl font-black text-white tabular">404</h1>
      <h2 className="mt-2 text-xl font-black text-slate-200">ضللت الطريق في المتاهة! 🌀</h2>
      <p className="mt-1 max-w-xs text-sm font-semibold leading-relaxed text-slate-400">
        هذه الصفحة غير موجودة — تماماً مثل حلقة بلا شرط توقف، لن تصل لشيء هنا!
      </p>
      <Link href="/" className="btn-3d-green mt-5 flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-emerald-950">
        <Home className="h-4 w-4" /> عودة للخريطة
      </Link>
    </div>
  );
}
