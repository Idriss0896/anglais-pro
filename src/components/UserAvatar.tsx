import { UserRound } from "lucide-react";
import type { User } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User | null;
  size?: number;
  onDark?: boolean;
  className?: string;
  alt?: string;
}

/**
 * Shows the member's photo. When there is none (or when browsing as a guest)
 * a neutral silhouette is displayed — never initials like the old "AP".
 */
export function UserAvatar({ user, size = 40, onDark = false, className, alt }: UserAvatarProps) {
  const avatar = user?.avatar;
  const dimension = { width: size, height: size };

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
        avatar
          ? "bg-white ring-2 ring-white/70"
          : onDark
            ? "bg-white/15 text-white/80 ring-2 ring-white/25"
            : "bg-gradient-to-br from-brand-100 to-sky-100 text-brand-600 ring-2 ring-white",
        className,
      )}
      style={dimension}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={alt ?? (user?.name ? `Photo de ${user.name}` : "Photo de profil")}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserRound size={Math.round(size * 0.52)} strokeWidth={2.2} />
      )}
    </span>
  );
}
