# Anglais Pro

> Apprendre l'anglais, 5 minutes par jour — cours, exercices, expressions et grammaire, du niveau A1 au B2.

Une application web **mobile-first** pensée pour les francophones qui veulent progresser en anglais sans s'ennuyer. Leçons courtes, exercices variés, révision intelligente et suivi de progression : tout est là pour installer une vraie habitude.

![Aperçu de l'accueil d'Anglais Pro](docs/preview.png)

<p align="center">
  <img src="docs/preview-mobile.png" alt="Aperçu mobile d'Anglais Pro" width="300" />
</p>

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Licence MIT" src="https://img.shields.io/badge/Licence-MIT-22C55E" />
</p>

---

## ✨ Fonctionnalités

- **Parcours structuré en 3 niveaux** — Fondations (A1–A2), Intermédiaire (B1), Avancé (B2).
- **63 leçons complètes** — chaque leçon combine théorie claire (encadrés, tableaux, phrases clés) et quiz interactif.
- **4 types d'exercices** — choix multiple, saisie de texte, reconstruction de phrases par tuiles et association de paires.
- **Bibliothèque filtrable** — recherche instantanée, filtres par niveau, catégorie et statut (à faire / terminé / favoris).
- **Grammaire & vocabulaire** — 17 fiches de grammaire et 14 thèmes de vocabulaire, consultables hors leçon.
- **910 expressions utiles** — avec traduction, note d'usage et écoute audio.
- **Révision ciblée** — sessions par compétence, marathon de 20 questions et flashcards.
- **Progression motivante** — XP, cœurs, série quotidienne, objectif journalier, rangs et succès.
- **Audio intégré** — prononciation via la synthèse vocale du navigateur (activable/désactivable).
- **Mobile d'abord** — navigation basse sur téléphone, sidebar sur ordinateur, transitions soignées.
- **Hors ligne côté données** — contenu et progression stockés localement (aucun serveur, aucun compte).

## 📚 Contenu

| Niveau | Nom | Référence CECRL | Leçons | Exercices |
| :----: | --- | :-------------: | -----: | --------: |
| 1 | Fondations | A1 – A2 | 23 | 301 |
| 2 | Intermédiaire | B1 | 22 | 250 |
| 3 | Avancé | B2 | 18 | 221 |
| **Total** | | | **63** | **772** |

- **910 expressions** prêtes à l'emploi
- **452 lignes de vocabulaire** réparties en 14 thèmes
- **17 fiches de grammaire** et **3 leçons de lecture**

## 🧱 Stack technique

| Rôle | Technologie |
| --- | --- |
| UI | [React 19](https://react.dev) + TypeScript |
| Build | [Vite 8](https://vite.dev) |
| Styles | [Tailwind CSS 4](https://tailwindcss.com) (thème personnalisé, composants utilitaires) |
| Navigation | [React Router 7](https://reactrouter.com) — `HashRouter` pour un hébergement statique |
| État global | [Zustand 5](https://zustand-demo.pmnd.rs) + `persist` (localStorage) |
| Icônes | [Lucide](https://lucide.dev) |
| Effets | [canvas-confetti](https://github.com/catdad/canvas-confetti) |

## 🚀 Démarrage

Prérequis : **Node.js 22+** et npm.

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
# → http://localhost:5173

# 3. Construire la version de production
npm run build
npm run preview
```

## 📜 Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | Sert localement le build de production |
| `npm run typecheck` | Vérification des types seule |

## 🗂 Architecture

Organisation **par fonctionnalité** : chaque domaine possède ses pages et sa logique, le reste est partagé.

```
anglais-pro/
├─ content/                 # Données pédagogiques (JSON, source de vérité)
│  ├─ level-1.json
│  ├─ level-2.json
│  └─ level-3.json
├─ public/                  # Favicon, icône, manifest PWA
├─ src/
│  ├─ components/           # UI partagée (shell, boutons, cartes, modales…)
│  ├─ data/
│  │  └─ curriculum.ts      # Agrégation, index et sélecteurs du contenu
│  ├─ features/
│  │  ├─ home/              # Tableau de bord
│  │  ├─ learn/             # Parcours
│  │  ├─ library/           # Bibliothèque de leçons (recherche + filtres)
│  │  ├─ grammar/           # Fiches de grammaire
│  │  ├─ vocabulary/        # Thèmes de vocabulaire
│  │  ├─ expressions/       # Expressions et favoris
│  │  ├─ practice/          # Révision, sessions, flashcards
│  │  ├─ lesson/            # Leçon + moteur de quiz
│  │  └─ progress/          # Statistiques et succès
│  ├─ lib/                  # Utilitaires, audio, succès, catégories
│  ├─ store/                # État persistant (XP, cœurs, série…)
│  ├─ types.ts              # Modèle de données typé
│  ├─ App.tsx               # Routes
│  └─ index.css             # Design system Tailwind
├─ .github/workflows/       # Déploiement GitHub Pages
└─ vite.config.ts
```

## 🧭 Routes

| Route | Page |
| --- | --- |
| `/` | Accueil / tableau de bord |
| `/learn` | Parcours par niveau |
| `/grammar` | Bibliothèque de grammaire |
| `/vocabulary` | Thèmes de vocabulaire |
| `/expressions` | Expressions et favoris |
| `/practice` | Choix du mode de révision |
| `/practice/session/:mode` | Session d'exercices |
| `/practice/flashcards` | Flashcards |
| `/lesson/:unitId` | Leçon (théorie + quiz) |
| `/progress` | Progression, succès et rangs |

## 🗃 Modèle de données

Le contenu vit dans `content/*.json`. Chaque fichier est un tableau de leçons :

```ts
interface Unit {
  id: string;
  cat: "grammar" | "vocabulary" | "expressions" | "reading";
  title: string;
  subtitle: string;
  emoji: string;
  theory: TheoryBlock[];  // paragraphes, titres, tableaux, phrases, astuces
  quiz: QuizQuestion[];   // choice | tiles | type | match
}
```

`src/data/curriculum.ts` enrichit ces unités avec leur niveau, puis expose des index prêts à l'emploi (`CURRICULUM`, `ALL_QUESTIONS`, `PHRASES`) et des sélecteurs pour les modes de révision.

## 🎨 Design system

- Palette principale violette (`brand`), accents vert/ambre/rose pour les catégories.
- Typographies **Bricolage Grotesque** (titres) et **Plus Jakarta Sans** (texte).
- Composants utilitaires dans `src/index.css` : `.card`, `.btn`, `.glass`, `.eyebrow`, `.safe-bottom`…
- Animations douces (`fade-up`, `float`, transitions) et respect de `prefers-reduced-motion`.
- Cibles tactiles ≥ 44 px, navigation basse sécurisée pour les encoches (`safe-area-inset`).

## 🌐 Déploiement

Le projet est prêt pour **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) :

1. Pousser le dépôt sur GitHub (branche `main`).
2. Dans **Settings → Pages**, choisir **Source : GitHub Actions**.
3. Chaque push sur `main` construit et publie automatiquement l'application.

Le build utilise `base: "./"` et un `HashRouter` : il fonctionne aussi bien à la racine d'un domaine que dans un sous-dossier, sans configuration serveur.

## 📄 Licence

Projet pédagogique — code sous licence **MIT**. Le contenu des leçons est fourni à titre d'exemple et peut être adapté librement.
