import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

/** Sous-ensemble du chunk Rollup utile au préchargement des dépendances. */
type Chunk = {
  name: string;
  fileName: string;
  imports: string[];
};

/**
 * Les pages de l'application sont chargées à la demande. Pour éviter que le
 * navigateur attende la fin du bundle principal avant de demander le chunk de
 * la page courante, on ajoute des `modulepreload` ciblés dès l'analyse du HTML.
 * La page de présentation n'est jamais concernée : elle garde son premier
 * rendu léger.
 */
function routePreload(): Plugin {
  return {
    name: "anglo-route-preload",
    apply: "build",
    generateBundle(_options, bundle) {
      const fileName = (name: string) => {
        const chunk = Object.values(bundle).find(
          (entry) => entry.type === "chunk" && entry.name === name,
        );
        return chunk?.type === "chunk" ? chunk.fileName : undefined;
      };

      const files = {
        AppShell: fileName("AppShell"),
        HomePage: fileName("HomePage"),
        LearnPage: fileName("LearnPage"),
        LibraryPage: fileName("LibraryPage"),
        GrammarPage: fileName("GrammarPage"),
        VocabularyPage: fileName("VocabularyPage"),
        ExpressionsPage: fileName("ExpressionsPage"),
        PracticePage: fileName("PracticePage"),
        PracticeSessionPage: fileName("PracticeSessionPage"),
        FlashcardsPage: fileName("FlashcardsPage"),
        LessonPage: fileName("LessonPage"),
        ProgressPage: fileName("ProgressPage"),
        SettingsPage: fileName("SettingsPage"),
        ProfilePage: fileName("ProfilePage"),
        AuthPage: fileName("AuthPage"),
        QuizSession: fileName("QuizSession"),
        content: fileName("content"),
      };

      // Un `modulepreload` ne charge que le fichier demandé, pas ses imports.
      // On collecte donc les dépendances statiques de chaque écran pour que le
      // navigateur les télécharge en parallèle du bundle principal.
      const chunks = Object.values(bundle)
        .filter((entry) => entry.type === "chunk")
        .map((entry) => entry as unknown as Chunk);
      const byName = new Map(chunks.map((chunk) => [chunk.name, chunk]));
      const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
      const collectDeps = (chunk: Chunk, seen: Set<string>) => {
        for (const imported of chunk.imports) {
          const file = imported.replace(/^\.\//, "");
          const dependency = byFile.get(file);
          if (!dependency || seen.has(dependency.fileName)) continue;
          seen.add(dependency.fileName);
          collectDeps(dependency, seen);
        }
        return seen;
      };
      const dependencies: Record<string, string[]> = {};
      for (const [name, file] of Object.entries(files)) {
        if (!file) continue;
        const chunk = byName.get(name);
        if (!chunk) continue;
        dependencies[name] = [...collectDeps(chunk, new Set<string>())];
      }

      const source = `(function () {
  var files = ${JSON.stringify(files)};
  var deps = ${JSON.stringify(dependencies)};
  var hash = window.location.hash || "";
  if (!hash || hash === "#" || hash === "#/" || hash.indexOf("#/auth") === 0) return;
  var path = hash.replace(/^#/, "").split("?")[0];
  var names = [];
  if (path.indexOf("/accueil") === 0) names = ["AppShell", "HomePage"];
  else if (path.indexOf("/lesson/") === 0) names = ["LessonPage", "content"];
  else if (path.indexOf("/practice/session/") === 0) names = ["PracticeSessionPage", "QuizSession", "content"];
  else if (path.indexOf("/practice/flashcards") === 0) names = ["AppShell", "FlashcardsPage", "content"];
  else if (path.indexOf("/practice") === 0 || path.indexOf("/exercices") === 0) names = ["AppShell", "PracticePage", "content"];
  else if (path.indexOf("/learn") === 0) names = ["AppShell", "LearnPage", "LibraryPage", "content"];
  else if (path.indexOf("/grammar") === 0) names = ["AppShell", "GrammarPage", "LibraryPage", "content"];
  else if (path.indexOf("/vocabulary") === 0) names = ["AppShell", "VocabularyPage", "LibraryPage", "content"];
  else if (path.indexOf("/expressions") === 0) names = ["AppShell", "ExpressionsPage", "LibraryPage", "content"];
  else if (path.indexOf("/progress") === 0) names = ["AppShell", "ProgressPage", "content"];
  else if (path.indexOf("/reglages") === 0) names = ["AppShell", "SettingsPage"];
  else if (path.indexOf("/profile") === 0) names = ["AppShell", "ProfilePage", "content"];
  else names = ["AppShell"];

  var base = "./";
  var seen = {};
  names.forEach(function (name) {
    var list = [files[name]].concat(deps[name] || []);
    list.forEach(function (file) {
      if (!file || seen[file]) return;
      seen[file] = true;
      var link = document.createElement("link");
      link.rel = "modulepreload";
      link.crossOrigin = "";
      link.href = base + file;
      document.head.appendChild(link);
    });
  });
})();
`;

      this.emitFile({ type: "asset", fileName: "route-preload.js", source });
    },
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { src: "./route-preload.js", defer: true },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

// Relative base keeps the build portable (GitHub Pages, Netlify, local file server).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), routePreload()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Content is intentionally shipped with the app, but split vendor/code so
    // browsers can cache them independently and the initial parse stays small.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
              return "react";
            }
            // Les confettis ne servent qu'à la fin d'un quiz ou d'une session :
            // inutile de les charger avec le premier écran.
            if (id.includes("canvas-confetti")) return "confetti";
            return "vendor";
          }
          if (id.includes("content") && id.includes("level-")) return "content";
        },
      },
    },
  },
});
