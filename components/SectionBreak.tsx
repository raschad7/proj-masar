/**
 * Breathing gap between pinned sections — a short normal-scroll strip
 * so consecutive pins don't feel like the page "sticks" repeatedly.
 */
export default function SectionBreak({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-28 md:py-36">
      <span className="pill flex items-center gap-2 bg-whitesmoke px-5 py-2.5 shadow-[var(--shadow-soft)]">
        <span className="h-2 w-2 rounded-full bg-peacock" aria-hidden />
        <span className="text-body-4 font-bold text-subtext">{label}</span>
      </span>
    </div>
  );
}
