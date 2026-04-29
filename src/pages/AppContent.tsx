import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Smartphone, Pencil, Languages } from "lucide-react";

const SECTIONS = [
  { key: "tiles",     en: { title: "Home tiles", desc: "Find a Member · Committees · Announcements · Documents" }, ar: { title: "أزرار الصفحة الرئيسية", desc: "بحث الأعضاء · اللجان · الإعلانات · المستندات" } },
  { key: "greeting",  en: { title: "Home greeting", desc: "Hi, {first name}! · Welcome subtitle" }, ar: { title: "تحية الصفحة الرئيسية", desc: "أهلاً، {الاسم الأول}! · عنوان فرعي للترحيب" } },
  { key: "feat-ev",   en: { title: "Featured event", desc: "Annual Business Summit 2026 - pinned" }, ar: { title: "الفعالية المميزة", desc: "قمة الأعمال السنوية 2026 - مثبّت" } },
  { key: "feat-an",   en: { title: "Featured announcement", desc: "Last Call: EJB x CIF 2026 - pinned" }, ar: { title: "الإعلان المميز", desc: "آخر مهلة: EJB × CIF 2026 - مثبّت" } },
  { key: "partners",  en: { title: "Partners strip", desc: "5 active partners shown in Platinum → Silver order" }, ar: { title: "شريط الشركاء", desc: "5 شركاء نشطون من البلاتيني إلى الفضي" } },
  { key: "nav",       en: { title: "Bottom nav labels", desc: "Home · Network · Updates · Hub · Profile" }, ar: { title: "تسميات الشريط السفلي", desc: "الرئيسية · الشبكة · المستجدات · المركز · الملف" } },
  { key: "maint",     en: { title: "Maintenance banner", desc: "Off - schedule by date" }, ar: { title: "شريط الصيانة", desc: "موقف - يحدّد بتاريخ" } },
  { key: "ver",       en: { title: "App version notes", desc: "v3.4.0 - Improved RSVP flow" }, ar: { title: "ملاحظات إصدار التطبيق", desc: "v3.4.0 - تحسين تدفق التسجيل" } },
];

export default function AppContent() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="App content"
        description="Configure everything members see in the mobile app"
        actions={
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            <button onClick={() => setLang("en")} className={`h-7 px-3 rounded text-xs flex items-center gap-1 ${lang === "en" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground"}`}>
              <Languages className="h-3 w-3" /> EN
            </button>
            <button onClick={() => setLang("ar")} className={`h-7 px-3 rounded text-xs flex items-center gap-1 ${lang === "ar" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground"}`}>
              AR
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir={isAr ? "rtl" : "ltr"}>
          {SECTIONS.map((s) => {
            const c = isAr ? s.ar : s.en;
            return (
              <div key={s.key} className="ejb-card p-4 ejb-card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0"><Smartphone className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold" lang={lang}>{c.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5" lang={lang}>{c.desc}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0"><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Last published 2 days ago</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Publish to app</Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile preview */}
        <aside className="lg:sticky lg:top-4 h-fit">
          <div className="ejb-eyebrow mb-2">Live preview · {isAr ? "Arabic" : "English"}</div>
          <div className="mx-auto w-[280px] rounded-[36px] border-[10px] border-foreground/90 bg-background shadow-xl overflow-hidden">
            <div className="h-6 bg-foreground/90 flex items-center justify-center">
              <div className="h-1 w-12 rounded-full bg-foreground/40" />
            </div>
            <div className="aspect-[9/18] bg-secondary/40 overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
              <div className="p-3">
                <div className="text-[11px] font-semibold" lang={lang}>
                  {isAr ? "أهلاً، أحمد!" : "Hi, Ahmed!"}
                </div>
                <div className="text-[9px] text-muted-foreground" lang={lang}>
                  {isAr ? "إليك آخر مستجدات EJB" : "Here is the latest from EJB"}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {(isAr ? ["بحث عضو", "اللجان", "الإعلانات", "المستندات"] : ["Find member", "Committees", "Updates", "Documents"]).map((t) => (
                    <div key={t} className="bg-card rounded-md p-2 text-[8px] font-medium text-center border border-border" lang={lang}>{t}</div>
                  ))}
                </div>

                <div className="mt-3 rounded-md bg-primary/10 border border-primary/30 p-2">
                  <div className="text-[7px] font-bold uppercase text-primary tracking-wider">{isAr ? "فعالية" : "Event"}</div>
                  <div className="text-[9px] font-semibold mt-0.5" lang={lang}>
                    {isAr ? "قمة الأعمال السنوية 2026" : "Annual Business Summit 2026"}
                  </div>
                  <div className="text-[7px] text-muted-foreground num">15 May · Grand Nile Tower</div>
                </div>

                <div className="mt-2 rounded-md bg-card border border-border p-2">
                  <div className="text-[7px] font-bold uppercase text-[hsl(var(--ejb-amber))] tracking-wider">{isAr ? "إعلان" : "Announcement"}</div>
                  <div className="text-[9px] font-semibold mt-0.5" lang={lang}>
                    {isAr ? "آخر مهلة: EJB × CIF 2026" : "Last Call: EJB x CIF 2026"}
                  </div>
                </div>

                <div className="mt-3 text-[7px] uppercase tracking-wider text-muted-foreground" lang={lang}>{isAr ? "شركاؤنا" : "Our partners"}</div>
                <div className="mt-1 flex gap-1">
                  {["CIB", "EFG", "ORC", "VOD", "HA"].map((p) => (
                    <div key={p} className="flex-1 h-7 rounded bg-card border border-border flex items-center justify-center text-[7px] font-bold text-muted-foreground">{p}</div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border bg-card grid grid-cols-5 px-1 py-1.5 sticky bottom-0">
                {(isAr ? ["الرئيسية", "الشبكة", "المستجدات", "المركز", "الملف"] : ["Home", "Network", "Updates", "Hub", "Profile"]).map((n, i) => (
                  <div key={n} className={`text-center text-[7px] py-0.5 ${i === 0 ? "text-primary font-semibold" : "text-muted-foreground"}`} lang={lang}>{n}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-center mt-2">Reflects current draft. Publish to push live.</div>
        </aside>
      </div>
    </div>
  );
}
