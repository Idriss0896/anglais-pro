import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudOff,
  Dumbbell,
  Flame,
  Gem,
  Globe2,
  Languages,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  SunMoon,
  Target,
  UserRound,
  UserRoundPlus,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";

interface MaterialIconProps {
  /** Nom historique, conservé pour ne pas modifier les pages existantes. */
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  /** Libellé accessible ; l'icône est décorative quand il est absent. */
  label?: string;
}

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  analytics: BarChart3,
  animation: Sparkles,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  brightness_auto: SunMoon,
  check: Check,
  chevron_right: ChevronRight,
  cloud_off: CloudOff,
  dark_mode: Moon,
  diamond: Gem,
  event_available: CalendarCheck,
  expand_more: ChevronDown,
  fitness_center: Dumbbell,
  graphic_eq: AudioLines,
  grid_view: LayoutGrid,
  layers: Layers,
  left_panel_close: PanelLeftClose,
  left_panel_open: PanelLeftOpen,
  light_mode: Sun,
  local_fire_department: Flame,
  login: LogIn,
  logout: LogOut,
  menu_book: BookOpen,
  palette: Palette,
  person: UserRound,
  person_add: UserRoundPlus,
  play_arrow: Play,
  public: Globe2,
  restart_alt: RotateCcw,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  track_changes: Target,
  translate: Languages,
  tune: SlidersHorizontal,
  volume_off: VolumeX,
  volume_up: Volume2,
};

/** Icône locale Lucide : aucune police distante ni ligature fragile. */
export function MaterialIcon({
  name,
  size = 20,
  filled = false,
  className,
  label,
}: MaterialIconProps) {
  const Icon = ICONS[name] ?? CircleHelp;

  return (
    <Icon
      className={["shrink-0", className ?? ""].filter(Boolean).join(" ")}
      size={size}
      strokeWidth={2.1}
      fill={filled ? "currentColor" : "none"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
