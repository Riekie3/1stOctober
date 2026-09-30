import { useEffect, useId, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

/* ─── Layout ────────────────────────────────────────────── */

export function Card({ title, hint, children, actions }: { title: string; hint?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gold/20 bg-cream p-5 shadow-[0_1px_2px_rgba(60,42,20,0.05)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.45rem] font-medium leading-tight text-ink">{title}</h2>
          {hint && <p className="mt-1 text-[0.82rem] text-taupe">{hint}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.78rem] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[0.74rem] text-taupe">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gold/25 bg-white px-3 py-2 text-[0.92rem] text-ink outline-none transition placeholder:text-taupe/60 focus:border-gold focus:ring-2 focus:ring-gold/20";

/* ─── Inputs ────────────────────────────────────────────── */

export function Text({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} className={inputCls} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function LongText({
  label,
  hint,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  // Grow with the text so long paragraphs are fully visible.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea id={id} ref={ref} rows={rows} className={`${inputCls} resize-none leading-relaxed`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TimeInput({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} type="time" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function DateInput({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} type="date" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} type="number" className={inputCls} value={Number.isFinite(value) ? value : ""} min={min} max={max} step={step} onChange={(e) => onChange(e.target.valueAsNumber)} />
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
      <label htmlFor={id} className="text-[0.86rem] text-ink">
        {label}
        {hint && <span className="block text-[0.74rem] text-taupe">{hint}</span>}
      </label>
    </div>
  );
}

/* ─── Lists ─────────────────────────────────────────────── */

export function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
}

export function ItemTools({ index, count, onMove, onRemove, removeLabel = "Remove" }: { index: number; count: number; onMove: (dir: -1 | 1) => void; onRemove?: () => void; removeLabel?: string }) {
  const btn = "grid h-8 w-8 place-items-center rounded-md text-taupe transition hover:bg-ivory hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className={btn} onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" title="Move up">
        <ArrowUp size={15} />
      </button>
      <button type="button" className={btn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" title="Move down">
        <ArrowDown size={15} />
      </button>
      {onRemove && (
        <button type="button" className={`${btn} hover:!bg-rose/10 hover:!text-rose`} onClick={onRemove} aria-label={removeLabel} title={removeLabel}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gold/40 py-3 text-[0.85rem] font-medium text-gold-deep transition hover:border-gold hover:bg-ivory"
    >
      <Plus size={16} /> {children}
    </button>
  );
}

/** Editable list of single lines/paragraphs. */
export function StringList({
  label,
  hint,
  items,
  onChange,
  addLabel,
  long = false,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
  long?: boolean;
}) {
  const update = (fn: (l: string[]) => void) => {
    const next = [...items];
    fn(next);
    onChange(next);
  };
  return (
    <div>
      <p className="mb-1.5 text-[0.78rem] font-semibold text-ink-soft">{label}</p>
      {hint && <p className="-mt-1 mb-2 text-[0.74rem] text-taupe">{hint}</p>}
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 w-5 shrink-0 text-right text-[0.72rem] tabular-nums text-taupe">{i + 1}</span>
            <div className="min-w-0 flex-1">
              {long ? (
                <AutoTextarea value={v} onChange={(t) => update((l) => (l[i] = t))} />
              ) : (
                <input className={inputCls} value={v} onChange={(e) => update((l) => (l[i] = e.target.value))} />
              )}
            </div>
            <ItemTools index={i} count={items.length} onMove={(d) => update((l) => move(l, i, d))} onRemove={() => update((l) => l.splice(i, 1))} />
          </div>
        ))}
        <AddButton onClick={() => update((l) => l.push(""))}>{addLabel}</AddButton>
      </div>
    </div>
  );
}

function AutoTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return <textarea ref={ref} rows={2} className={`${inputCls} resize-none leading-relaxed`} value={value} onChange={(e) => onChange(e.target.value)} />;
}
