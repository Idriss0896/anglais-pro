import { cn } from "@/lib/utils";

/**
 * Petit égaliseur animé qui remplace l'icône haut-parleur pendant la lecture.
 * Il rend l'écoute visible, y compris sur mobile.
 */
export function SoundBars({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex h-[15px] w-[15px] items-end justify-center gap-[2.5px]", className)}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="eq-bar w-[3px] rounded-full bg-current"
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
  );
}
