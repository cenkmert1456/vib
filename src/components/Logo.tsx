import { cn } from "@/lib/utils";

export function LogoMark({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="vybe-mark-grad" x1="8" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="0.55" stopColor="#C026D3" />
          <stop offset="1" stopColor="#F0569A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#vybe-mark-grad)" />
      {/* V / energy wave formed by two strokes */}
      <path
        d="M18 22c5.5 0 8.5 4.5 14 4.5S40.5 22 46 22c4.4 0 7.4 2.6 7.4 2.6"
        stroke="white"
        strokeWidth="4.6"
        strokeLinecap="round"
        opacity="0.98"
      />
      <path
        d="M18 33c5.5 0 8.5 4.5 14 4.5S40.5 33 46 33c4.4 0 7.4 2.6 7.4 2.6"
        stroke="white"
        strokeWidth="4.6"
        strokeLinecap="round"
        opacity="0.78"
      />
      <path
        d="M18 44c5.5 0 8.5 4.5 14 4.5S40.5 44 46 44c4.4 0 7.4 2.6 7.4 2.6"
        stroke="white"
        strokeWidth="4.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={30} />
      <span
        className={cn(
          "font-display text-2xl font-bold tracking-[0.18em]",
          textClassName,
        )}
      >
        VYBE
      </span>
    </span>
  );
}
