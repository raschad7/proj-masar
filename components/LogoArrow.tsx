/* Single مسار arrow — the centre chevron lifted from the brand logo.
   Points down by default (like the logo's middle mark). Colour via
   the `color` prop (maps to fill). Reused across hero hotspots, the
   features map, and the side-nav ticks so every arrow is the one mark. */
export default function LogoArrow({
  color = "currentColor",
  className,
  style,
}: {
  color?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="18 17 20 23"
      className={className}
      style={style}
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z"
        fill={color}
      />
    </svg>
  )
}
