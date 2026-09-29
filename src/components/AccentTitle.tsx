/**
 * Renders a title with its last word in gold italic, keeping the last two
 * words together so the accent never sits alone on a line.
 */
export default function AccentTitle({ text, accentClass = "font-light text-gold-deep" }: { text: string; accentClass?: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return <em className={accentClass}>{text}</em>;
  const last = words.pop();
  const beforeLast = words.pop();
  return (
    <>
      {words.length > 0 && `${words.join(" ")} `}
      <span className="whitespace-nowrap">
        {beforeLast} <em className={accentClass}>{last}</em>
      </span>
    </>
  );
}
