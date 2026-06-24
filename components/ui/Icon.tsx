/**
 * Jeu d'icônes SVG inline (trait), sans dépendance externe.
 * Style cohérent : pictogrammes simples (CDC §5.5 — iconographie par service/étape).
 * Les icônes sont décoratives par défaut (aria-hidden) ; passer `title` pour les rendre
 * accessibles si elles portent du sens.
 */
import { cn } from "@/lib/cn";

export type IconName =
  | "shield"
  | "check"
  | "check-circle"
  | "bolt"
  | "hands"
  | "graduation"
  | "child"
  | "home"
  | "chef"
  | "car"
  | "edit"
  | "search"
  | "users"
  | "handshake"
  | "heart"
  | "profile"
  | "phone"
  | "mail"
  | "menu"
  | "close"
  | "star"
  | "chevron-down"
  | "arrow-right"
  | "location"
  | "clock"
  | "lock"
  | "facebook"
  | "instagram"
  | "linkedin";

const paths: Record<IconName, React.ReactNode> = {
  shield: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />,
  check: <path d="M5 13l4 4L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  bolt: <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />,
  hands: (
    <path d="M3 12l4-1 3 3 4-7 3 2v6a3 3 0 01-3 3H7a4 4 0 01-4-4v-2z" />
  ),
  graduation: (
    <>
      <path d="M3 9l9-4 9 4-9 4-9-4z" />
      <path d="M7 11v4c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M8 21v-5l-2-1 1-4a3 3 0 016 0l1 4-2 1v5" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7M6 10v9h12v-9" />,
  chef: (
    <>
      <path d="M7 14a4 4 0 11.5-7.97 4 4 0 018.99 0A4 4 0 1117 14" />
      <path d="M7 14v5h10v-5" />
    </>
  ),
  car: (
    <>
      <path d="M5 16l1.5-5h11L19 16M3 16h18v3h-2v-1H5v1H3v-3z" />
      <circle cx="7.5" cy="16.5" r="1.2" />
      <circle cx="16.5" cy="16.5" r="1.2" />
    </>
  ),
  edit: <path d="M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0M16 6a3 3 0 010 6M21 20a6 6 0 00-4-5.6" />
    </>
  ),
  handshake: <path d="M3 11l3-3 4 3 2-2 2 2 4-3 3 3-5 5-2-2-2 2-2-2-2 2-3-5z" />,
  heart: (
    <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.5 12 20 12 20z" />
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  phone: (
    <path d="M5 4h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  star: (
    <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4z" />
  ),
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  location: (
    <>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  facebook: (
    <path d="M14 8h2V5h-2a3 3 0 00-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8a1 1 0 011-1z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.6" />
    </>
  ),
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4" />
    </>
  ),
};

export function Icon({
  name,
  className,
  title,
  strokeWidth = 1.7,
}: {
  name: IconName;
  className?: string;
  title?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
