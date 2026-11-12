import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MascotId = "mia" | "leo" | "zoe" | "sam";
export type MascotMood = "hello" | "talk" | "think" | "cheer" | "wink";

interface Palette {
  name: string;
  role: string;
  accent: string;
  soft: string;
  ring: string;
  skin: string;
  skinShade: string;
  hair: string;
  shirt: string;
  bg: [string, string];
}

export const MASCOTS: Record<MascotId, Palette> = {
  mia: {
    name: "Mia",
    role: "Coach des expressions",
    accent: "text-violet-700",
    soft: "bg-violet-50",
    ring: "ring-violet-100",
    skin: "#f7c9a8",
    skinShade: "#e9b492",
    hair: "#33254a",
    shirt: "#6d5ce7",
    bg: ["#ede9fe", "#d8d0fd"],
  },
  leo: {
    name: "Leo",
    role: "Coach de grammaire",
    accent: "text-sky-700",
    soft: "bg-sky-50",
    ring: "ring-sky-100",
    skin: "#eeb389",
    skinShade: "#dda077",
    hair: "#3a2b23",
    shirt: "#0ea5e9",
    bg: ["#e0f2fe", "#c2e7fd"],
  },
  zoe: {
    name: "Zoé",
    role: "Coach du vocabulaire",
    accent: "text-emerald-700",
    soft: "bg-emerald-50",
    ring: "ring-emerald-100",
    skin: "#b07350",
    skinShade: "#9a6243",
    hair: "#211c2c",
    shirt: "#10b981",
    bg: ["#d1fae5", "#b3f2dd"],
  },
  sam: {
    name: "Sam",
    role: "Coach de prononciation",
    accent: "text-amber-700",
    soft: "bg-amber-50",
    ring: "ring-amber-100",
    skin: "#f3d3b2",
    skinShade: "#e2bd99",
    hair: "#9a4a12",
    shirt: "#f59e0b",
    bg: ["#fef3c7", "#fce6a8"],
  },
};

const MASCOT_IDS: MascotId[] = ["mia", "leo", "zoe", "sam"];

/** Choisit toujours le même personnage pour un même identifiant (unité, mot…). */
export function mascotFor(seed: string): MascotId {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return MASCOT_IDS[hash % MASCOT_IDS.length];
}

interface MascotProps {
  id?: MascotId;
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** Anime doucement le personnage (flottement + clignement des yeux). */
  animated?: boolean;
  title?: string;
}

/**
 * Petits personnages dessinés en SVG : ils accompagnent les expressions, les
 * mots et les conseils pour rendre l'explication plus vivante.
 */
export function Mascot({
  id = "mia",
  mood = "talk",
  size = 56,
  className,
  animated = true,
  title,
}: MascotProps) {
  const uid = useId().replace(/[:]/g, "");
  const c = MASCOTS[id];
  const longHair = id === "mia" || id === "zoe";
  const label = title ?? `${c.name}, ${c.role.toLowerCase()}`;

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cn("shrink-0", animated && "mascot-float", className)}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.bg[0]} />
          <stop offset="100%" stopColor={c.bg[1]} />
        </linearGradient>
        <clipPath id={`${uid}-circle`}>
          <circle cx="48" cy="48" r="46" />
        </clipPath>
        <clipPath id={`${uid}-head`}>
          <circle cx="48" cy="47" r="21" />
        </clipPath>
      </defs>

      <circle cx="48" cy="48" r="46" fill={`url(#${uid}-bg)`} />

      <g clipPath={`url(#${uid}-circle)`}>
        <circle cx="20" cy="22" r="20" fill="#ffffff" opacity="0.32" />
        <circle cx="82" cy="78" r="24" fill="#ffffff" opacity="0.16" />

        {/* Épaules et buste */}
        <path d="M12 96c1.4-16.5 12.5-27.5 28-30.5h16c15.5 3 26.6 14 28 30.5z" fill={c.shirt} />
        <path
          d="M12 96c1.4-16.5 12.5-27.5 28-30.5h6V96z"
          fill="#000000"
          opacity="0.08"
        />
        <path d="M40 61.5h16v10.5a8 8 0 0 1-16 0z" fill={c.skinShade} />
        <path
          d="M39.5 63.5c2.4 4.6 5.4 6.8 8.5 6.8s6.1-2.2 8.5-6.8"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Oreilles */}
        <circle cx="25.5" cy="48.5" r="5" fill={c.skin} />
        <circle cx="70.5" cy="48.5" r="5" fill={c.skin} />

        {/* Cheveux longs derrière la tête */}
        {longHair && (
          <path
            d="M21 47c0-16.2 12.1-28.6 27-28.6S75 30.8 75 47v15.5c0 4.4-3.2 7.5-7.2 7.5H28.2c-4 0-7.2-3.1-7.2-7.5z"
            fill={c.hair}
          />
        )}

        {/* Volume de cheveux */}
        {id !== "sam" && (
          <ellipse
            cx="48"
            cy={id === "leo" ? 33 : 31}
            rx={id === "zoe" ? 25 : 23.5}
            ry={id === "leo" ? 16 : 19}
            fill={c.hair}
          />
        )}

        {/* Visage */}
        <circle cx="48" cy="47" r="21" fill={c.skin} />

        {/* Frange */}
        {id !== "sam" && (
          <g clipPath={`url(#${uid}-head)`}>
            <path
              d={
                id === "leo"
                  ? "M26 38C26 26 36 18 48 18C60 18 70 26 70 38C66 40 62 38 58 35C54 39 47 40.5 41 38.5C35 37 30 34 26 38Z"
                  : "M24 40C24 26 35 17 48 17C61 17 72 26 72 40C68 42 64 40 60 37C56 41 50 42.5 44 41.5C38 40.5 33 37 30 41C28 42.5 26 41.5 24 40Z"
              }
              fill={c.hair}
            />
          </g>
        )}

        {/* Mèches / boucles */}
        {id === "zoe" && (
          <>
            <circle cx="28" cy="33" r="7.5" fill={c.hair} />
            <circle cx="68" cy="33" r="7.5" fill={c.hair} />
            <circle cx="42" cy="25" r="7" fill={c.hair} />
            <circle cx="55" cy="25.5" r="6.5" fill={c.hair} />
          </>
        )}

        {/* Casquette de Sam */}
        {id === "sam" && (
          <>
            <path d="M26.5 35.5c0-12 9.4-20.5 21.5-20.5s21.5 8.5 21.5 20.5z" fill={c.shirt} />
            <path d="M24 34.5h30.5c2.6 0 4.2 1.4 4.2 3.2 0 1.7-1.5 2.8-4 2.8H28.5c-3 0-4.5-1.7-4.5-6z" fill="#d97706" />
            <circle cx="48" cy="16.5" r="2.2" fill="#fef3c7" />
            <path d="M29 34.5c2-8 9-13 19-13s17 5 19 13" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="2" />
          </>
        )}

        {/* Yeux */}
        {mood === "wink" ? (
          <>
            <path d="M35.5 47.5c2-2.2 4.6-2.2 6.6 0" fill="none" stroke="#232135" strokeWidth="2.2" strokeLinecap="round" />
            <g className="mascot-eye">
              <ellipse cx="56.5" cy="46.5" rx="2.6" ry="3.4" fill="#232135" />
              <circle cx="57.5" cy="45.4" r="0.9" fill="#ffffff" />
            </g>
          </>
        ) : (
          <>
            <g className="mascot-eye">
              <ellipse cx="39.5" cy="46.5" rx="2.6" ry="3.4" fill="#232135" />
              <circle cx="40.5" cy="45.4" r="0.9" fill="#ffffff" />
            </g>
            <g className="mascot-eye" style={{ animationDelay: "0.18s" }}>
              <ellipse cx="56.5" cy="46.5" rx="2.6" ry="3.4" fill="#232135" />
              <circle cx="57.5" cy="45.4" r="0.9" fill="#ffffff" />
            </g>
          </>
        )}

        {/* Nez */}
        <path d="M47 51.5c1 0.9 2 0.9 3 0" fill="none" stroke={c.skinShade} strokeWidth="1.5" strokeLinecap="round" />

        {/* Bouche */}
        {mood === "cheer" || mood === "hello" ? (
          <path d="M41.5 57.5c1.8 4.2 4 6.3 6.5 6.3s4.7-2.1 6.5-6.3z" fill="#a8484f" />
        ) : mood === "think" ? (
          <circle cx="48" cy="59.5" r="1.9" fill="#a8484f" />
        ) : (
          <path d="M42.5 58c1.6 2.8 3.4 4.2 5.5 4.2s3.9-1.4 5.5-4.2" fill="none" stroke="#a8484f" strokeWidth="2.1" strokeLinecap="round" />
        )}

        {/* Joues */}
        <ellipse cx="33.5" cy="54.5" rx="4.2" ry="2.6" fill="#ef7a8b" opacity="0.28" />
        <ellipse cx="62.5" cy="54.5" rx="4.2" ry="2.6" fill="#ef7a8b" opacity="0.28" />

        {/* Accessoires */}
        {id === "leo" && (
          <g>
            <rect x="33.2" y="41.4" width="13" height="10.2" rx="4.4" fill="#ffffff" fillOpacity="0.22" stroke="#2c2438" strokeWidth="1.7" />
            <rect x="49.8" y="41.4" width="13" height="10.2" rx="4.4" fill="#ffffff" fillOpacity="0.22" stroke="#2c2438" strokeWidth="1.7" />
            <path d="M46.2 45.8h3.6" stroke="#2c2438" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M33.4 44.5l-4.2-1.4M62.6 44.5l4.2-1.4" stroke="#2c2438" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {id === "mia" && (
          <g transform="rotate(-18 67 30)">
            <rect x="63" y="27.5" width="8.5" height="4.6" rx="2.2" fill="#f59e0b" />
            <circle cx="67.2" cy="24.6" r="3.6" fill="#fbbf24" />
            <circle cx="67.2" cy="24.6" r="1.4" fill="#f59e0b" />
          </g>
        )}

        {id === "zoe" && (
          <>
            <circle cx="25.5" cy="56.5" r="2.6" fill="none" stroke="#fbbf24" strokeWidth="1.7" />
            <circle cx="70.5" cy="56.5" r="2.6" fill="none" stroke="#fbbf24" strokeWidth="1.7" />
          </>
        )}

        {/* Mains expressives */}
        {mood === "hello" && (
          <ellipse cx="76" cy="82" rx="8" ry="6" fill={c.skin} opacity="0.9" />
        )}
      </g>

      <circle cx="48" cy="48" r="45.3" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.6" />
    </svg>
  );
}

interface MascotSayProps {
  id?: MascotId;
  mood?: MascotMood;
  /** Texte affiché au-dessus de la bulle (« Mia explique »). */
  label?: string;
  children: ReactNode;
  className?: string;
  size?: number;
  tone?: "light" | "tinted";
}

/**
 * Un personnage + sa bulle : le duo sert à expliquer une expression, un mot ou
 * un point de grammaire avec des mots simples.
 */
export function MascotSay({
  id = "mia",
  mood = "talk",
  label,
  children,
  className,
  size = 46,
  tone = "tinted",
}: MascotSayProps) {
  const c = MASCOTS[id];

  return (
    <div className={cn("flex items-end gap-2.5", className)}>
      <Mascot id={id} mood={mood} size={size} />
      <div
        className={cn(
          "relative min-w-0 flex-1 rounded-[18px] rounded-bl-[7px] px-3.5 py-2.5 ring-1",
          tone === "tinted" ? cn(c.soft, c.ring) : "bg-white ring-slate-900/[0.06]",
        )}
      >
        {(label ?? c.name) && (
          <p className={cn("text-[9px] font-extrabold uppercase tracking-[0.14em]", c.accent)}>
            {label ?? `${c.name} explique`}
          </p>
        )}
        <div className="mt-1 text-[12px] font-semibold leading-5 text-slate-600">{children}</div>
      </div>
    </div>
  );
}
