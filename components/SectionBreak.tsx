/**
 * Breathing gap between pinned sections — a short normal-scroll strip
 * so consecutive pins don't feel like the page "sticks" repeatedly.
 */
export default function SectionBreak(props: {
  label?: string
  gap?: number | string
}) {
  // Label pill removed sitewide; the breathing gap between pinned sections
  // is retained so consecutive pins don't feel like the page sticks.
  return (
    <div
      className={props.gap !== undefined ? "" : "py-8 md:py-12"}
      style={props.gap !== undefined ? { height: props.gap } : undefined}
    />
  )
}
