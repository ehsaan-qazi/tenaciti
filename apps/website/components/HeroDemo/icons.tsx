/**
 * Shared inline SVG icons for the HeroDemo scenes.
 * Stroke-based, 24×24 viewBox — matches the existing Tenaciti visual language.
 * All decorative; aria-hidden by default.
 */

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

function base(size: number | undefined, strokeWidth: number | undefined, className: string | undefined, style: React.CSSProperties | undefined) {
  return {
    width: size ?? 14,
    height: size ?? 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: strokeWidth ?? 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
    'aria-hidden': true as const,
  };
}

export function IconBookOpen(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconListChecks(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

export function IconGauge(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

export function IconClipboardList(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

export function IconTarget(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconFolderOpen(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconCalendar(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconGraduationCap(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="M22 10 12 5 2 10l10 5z" />
      <path d="M6 12.5V17c3 2.6 9 2.6 12 0v-4.5" />
      <path d="M22 10v6" />
    </svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth ?? 2.5, p.className, p.style)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconSparkles(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="m12 3 1.9 5.7a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconFileText(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth ?? 2.5, p.className, p.style)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconLink(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function IconFlag(p: IconProps) {
  return (
    <svg {...base(p.size, p.strokeWidth, p.className, p.style)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
