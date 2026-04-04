"use client";

import { useState, useRef } from "react";
import { useHoldRepeat } from "./useHoldRepeat";

interface StepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  formatValue?: (v: number) => string;
}

export function Stepper({ label, value, onChange, min, max, step, unit, formatValue }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const decrement = useHoldRepeat(
    () => onChange(Math.max(min, valueRef.current - step)),
    [onChange, min, step],
  );
  const increment = useHoldRepeat(
    () => onChange(Math.min(max, valueRef.current + step)),
    [onChange, max, step],
  );

  const startEdit = () => {
    setEditValue(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    setEditing(false);
    const n = parseInt(editValue);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none"
          onPointerDown={decrement.start}
          onPointerUp={decrement.stop}
          onPointerLeave={decrement.stop}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            className="w-16 text-center tabular-nums font-semibold bg-transparent border-b border-primary outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); }}
          />
        ) : (
          <button
            type="button"
            className="w-16 text-center tabular-nums font-semibold"
            onClick={startEdit}
          >
            {formatValue ? formatValue(value) : `${value}${unit}`}
          </button>
        )}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground active:bg-muted select-none"
          onPointerDown={increment.start}
          onPointerUp={increment.stop}
          onPointerLeave={increment.stop}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>
    </div>
  );
}
