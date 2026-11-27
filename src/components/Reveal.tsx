import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Délai en millisecondes pour décaler l'apparition. */
  delay?: number;
  className?: string;
  /** Permet de rester dans une liste sémantique (ul/ol) sans div parasite. */
  as?: "div" | "li" | "article";
}

/**
 * Fait apparaître son contenu en douceur quand il entre dans le viewport.
 * Le rendu final est identique sans JavaScript : le contenu est seulement
 * décalé de quelques pixels pendant l'animation.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

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
      { threshold: 0.14, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return createElement(
    Tag,
    {
      ref,
      className: cn("reveal", visible && "is-visible", className),
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
