import { useEffect, useRef, useState, KeyboardEvent, FocusEvent, WheelEvent } from "react";

interface TravellersInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
}

/**
 * Controlled numeric input for a traveller count.
 *
 * - Allows temporary empty/intermediate values while typing.
 * - Commits (clamps + floors) on blur, Enter, or arrow-button changes.
 * - Prevents accidental mouse-wheel changes when focused.
 */
export default function TravellersInput({
  value,
  onChange,
  min = 1,
  max = 20,
  className,
  id,
}: TravellersInputProps) {
  const [draft, setDraft] = useState<string>(String(value));
  const focusedRef = useRef(false);

  // Keep draft in sync when the committed value changes externally,
  // but never overwrite what the user is actively typing.
  useEffect(() => {
    if (!focusedRef.current) setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    let n: number;
    if (trimmed === "") n = min;
    else {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) n = min;
      else n = Math.floor(parsed);
    }
    if (n < min) n = min;
    if (n > max) n = max;
    setDraft(String(n));
    if (n !== value) onChange(n);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    focusedRef.current = false;
    commit(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    if (document.activeElement === e.currentTarget) {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={min}
      max={max}
      step={1}
      value={draft}
      aria-label="Number of travellers"
      onFocus={() => { focusedRef.current = true; }}
      onChange={(e) => {
        const v = e.target.value;
        setDraft(v);
        // Arrow-button clicks fire onChange with a valid numeric string
        // while the field isn't focused (or is briefly). Commit immediately
        // in that case so calculations update without needing a blur.
        if (!focusedRef.current && v !== "" && /^-?\d+$/.test(v)) {
          commit(v);
        }
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      className={className}
    />
  );
}
