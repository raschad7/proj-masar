/**
 * Breathing gap between pinned sections — a short normal-scroll strip
 * so consecutive pins don't feel like the page "sticks" repeatedly.
 */
export default function SectionBreak(_props: { label?: string }) {
  // Label pill removed sitewide; the breathing gap between pinned sections
  // is retained so consecutive pins don't feel like the page sticks.
  return <div className="py-28 md:py-36" />;
}
