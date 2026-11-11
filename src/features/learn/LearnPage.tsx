import { LibraryPage } from "@/features/library/LibraryPage";
import { LayoutGrid } from "lucide-react";

export function LearnPage() {
  return (
    <LibraryPage
      eyebrow="Bibliothèque"
      title="Ton parcours"
      description="Toutes les leçons, classées par niveau et par thème. Choisis une leçon, révise les bases ou explore un nouveau sujet."
      icon={LayoutGrid}
    />
  );
}
