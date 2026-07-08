/**
 * Faint ghosted city street map — shared background texture.
 * Thin grey grid streets, curved arterials, soft building blocks.
 * Pure decoration (aria-hidden); parent controls opacity/masking.
 */
export default function CityMapBg({
  className = "",
  fade = true,
}: {
  className?: string;
  fade?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={
        fade
          ? {
              maskImage:
                "radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 78%)",
            }
          : undefined
      }
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* grid streets */}
        <g stroke="#B7B7B7" strokeWidth="1" opacity="0.55">
          {[120, 280, 440, 600, 760, 920, 1080, 1240, 1400].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x - 40} y2="900" />
          ))}
          {[90, 230, 370, 510, 650, 790].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y + 28} />
          ))}
        </g>

        {/* curved arterial roads */}
        <g stroke="#B7B7B7" strokeWidth="2.5" opacity="0.5" strokeLinecap="round">
          <path d="M-40 640 C 300 560, 520 760, 860 620 S 1360 480, 1500 560" />
          <path d="M180 -40 C 260 220, 120 420, 340 640 S 520 880, 460 960" />
          <path d="M1500 180 C 1180 260, 980 140, 700 260 S 260 340, -40 260" />
        </g>

      </svg>
    </div>
  );
}
