import type { HTMLAttributes } from "react";

export interface MaterialIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nom Material Symbol ; les anciens noms sont conservés via ICON_ALIASES. */
  name: string;
  size?: number;
  filled?: boolean;
  label?: string;
}

const ICON_ALIASES: Record<string, string> = {
  activity: "monitoring",
  analytics: "monitoring",
  animation: "auto_awesome",
  arrow_back: "arrow_back",
  arrow_forward: "arrow_forward",
  brightness_auto: "brightness_auto",
  check: "check",
  chevron_right: "chevron_right",
  cloud_off: "cloud_off",
  dark_mode: "dark_mode",
  diamond: "diamond",
  event_available: "event_available",
  expand_more: "expand_more",
  fitness_center: "fitness_center",
  graphic_eq: "graphic_eq",
  grid_view: "grid_view",
  layers: "layers",
  left_panel_close: "left_panel_close",
  left_panel_open: "left_panel_open",
  light_mode: "light_mode",
  local_fire_department: "local_fire_department",
  login: "login",
  logout: "logout",
  menu_book: "menu_book",
  palette: "palette",
  person: "person",
  person_add: "person_add",
  play_arrow: "play_arrow",
  public: "public",
  restart_alt: "restart_alt",
  search: "search",
  settings: "settings",
  shield: "shield",
  track_changes: "track_changes",
  translate: "translate",
  tune: "tune",
  volume_off: "volume_off",
  volume_up: "volume_up",
};

const SUPPORTED_SYMBOLS = new Set([
  "add_photo_alternate",
  "ads_click",
  "arrow_back",
  "arrow_forward",
  "auto_awesome",
  "auto_stories",
  "bar_chart",
  "bookmark",
  "bookmark_added",
  "brightness_auto",
  "business_center",
  "calendar_month",
  "cancel",
  "category",
  "chat_bubble",
  "check",
  "check_circle",
  "checklist",
  "chevron_right",
  "close",
  "cloud",
  "cloud_off",
  "cloud_upload",
  "content_copy",
  "dark_mode",
  "description",
  "diamond",
  "dictionary",
  "directions_walk",
  "edit",
  "emoji_events",
  "error",
  "event_available",
  "expand_more",
  "explore",
  "fact_check",
  "favorite",
  "fitness_center",
  "format_quote",
  "graphic_eq",
  "grid_view",
  "help",
  "home",
  "interests",
  "key",
  "keyboard_return",
  "layers",
  "left_panel_close",
  "left_panel_open",
  "light_mode",
  "lightbulb",
  "link",
  "local_fire_department",
  "lock",
  "login",
  "logout",
  "mail",
  "menu",
  "menu_book",
  "mic",
  "military_tech",
  "monitoring",
  "north_east",
  "palette",
  "person",
  "person_add",
  "photo_camera",
  "play_arrow",
  "play_circle",
  "progress_activity",
  "psychology",
  "public",
  "refresh",
  "restart_alt",
  "rocket_launch",
  "save",
  "schedule",
  "school",
  "search",
  "sell",
  "settings",
  "settings_suggest",
  "shield",
  "spa",
  "speed",
  "table_chart",
  "track_changes",
  "translate",
  "tune",
  "verified",
  "verified_user",
  "visibility",
  "visibility_off",
  "volume_off",
  "volume_up",
  "wifi_off",
  "work",
  "workspace_premium",
]);

/** Google Material Symbols Rounded, chargé dans index.html. */
export function MaterialIcon({
  name,
  size = 20,
  filled = false,
  className,
  label,
  style,
  ...attributes
}: MaterialIconProps) {
  const symbol = ICON_ALIASES[name] ?? (SUPPORTED_SYMBOLS.has(name) ? name : "help");

  return (
    <span
      {...attributes}
      className={["google-symbol shrink-0", className ?? ""].filter(Boolean).join(" ")}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 500, "GRAD" 0, "opsz" ${size}`,
        ...style,
      }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {symbol}
    </span>
  );
}
