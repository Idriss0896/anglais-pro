import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface DeferredSectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Hauteur réservée avant le rendu, pour ne jamais déplacer le contenu déjà lu. */
  minHeight?: number;
}

/**
 * Rend une section seulement lorsqu'elle approche de l'écran. Le premier
 * affichage reste léger, tout en conservant la place nécessaire pour éviter
 * tout saut de mise en page.
 */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

export function DeferredSection({
  children,
  className,
  style,
  minHeight = 480,
}: DeferredSectionProps) {
  const { ref, visible } = useNearViewport<HTMLElement>();

  return (
    <section
      ref={ref}
      className={cn(className)}
      style={visible ? style : { ...style, minHeight }}
    >
      {visible ? children : null}
    </section>
  );
}

/** Même principe pour un bloc sans sémantique de section (carte, panneau…). */
export function DeferredBlock({
  children,
  className,
  style,
  minHeight = 180,
}: DeferredSectionProps) {
  const { ref, visible } = useNearViewport<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={visible ? style : { ...style, minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}
