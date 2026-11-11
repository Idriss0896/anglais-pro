import { BookOpen, Lightbulb } from "lucide-react";
import { LibraryPage } from "@/features/library/LibraryPage";

function GrammarBanner() {
  return (
    <div className="animate-fade-up relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-5 text-white shadow-[0_24px_50px_-26px_rgba(79,70,229,.8)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-25" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75 ring-1 ring-white/10">
            <Lightbulb size={12} className="text-amber-300" />
            La méthode
          </span>
          <h2 className="mt-3 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
            Une règle à la fois, avec des exemples concrets.
          </h2>
          <p className="mt-1.5 text-[12.5px] font-medium leading-6 text-white/60">
            Chaque fiche contient des tableaux clairs, des phrases à écouter et un quiz
            pour vérifier que tout est bien ancré.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Tableaux clairs", "Audio intégré", "Quiz corrigés"].map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold text-white/80 ring-1 ring-white/10"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GrammarPage() {
  return (
    <LibraryPage
      eyebrow="Fiches de grammaire"
      title="La grammaire, sans jargon"
      description="Comprendre les structures de l'anglais pour construire des phrases justes, naturellement."
      icon={BookOpen}
      iconTone="from-indigo-500 to-violet-600"
      fixedCategory="grammar"
      banner={<GrammarBanner />}
    />
  );
}
