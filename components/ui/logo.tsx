import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** The "L" serif lettermark in a rounded forest-green square */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.52);
  return (
    <div
      className={cn("shrink-0 flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        background: "#1a6b54",
        borderRadius: radius,
      }}
    >
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          color: "#f7fbfa",
          fontSize: fontSize,
          lineHeight: 1,
          userSelect: "none",
          display: "block",
          marginBottom: 1,
        }}
      >
        L
      </span>
    </div>
  );
}

interface LogoWordmarkProps {
  className?: string;
  /** Size variant. Defaults to "md" */
  size?: "sm" | "md" | "lg" | "xl";
  /** Colour for "Loft" — defaults to forest green */
  accentClassName?: string;
}

const wordmarkSizes = {
  sm:  "text-base",
  md:  "text-xl",
  lg:  "text-2xl",
  xl:  "text-4xl",
};

/**
 * "CPA" (bold) + " " + "Loft" (light) in Georgia serif.
 * accentClassName is applied to the "Loft" span; defaults to text-forest-600.
 */
export function LogoWordmark({
  className,
  size = "md",
  accentClassName = "text-forest-600",
}: LogoWordmarkProps) {
  return (
    <span
      className={cn("font-serif tracking-tight text-foreground", wordmarkSizes[size], className)}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <span style={{ fontWeight: 700 }}>CPA</span>
      {" "}
      <span className={accentClassName} style={{ fontWeight: 300 }}>Loft</span>
    </span>
  );
}

/** Full logo: mark + wordmark side by side */
export function Logo({
  markSize = 32,
  wordmarkSize = "md",
  className,
  /** Pass "light" when rendered on a dark background */
  variant = "default",
}: {
  markSize?: number;
  wordmarkSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <LogoWordmark
        size={wordmarkSize}
        className={variant === "light" ? "text-cloud" : undefined}
        accentClassName={variant === "light" ? "text-mint" : "text-forest-600"}
      />
    </div>
  );
}
