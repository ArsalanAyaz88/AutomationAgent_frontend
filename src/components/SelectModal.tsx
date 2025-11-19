"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
};

export default function SelectModal({ value, onChange, options, placeholder = "Select...", className = "", label }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find(o => o.value === value)?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="w-full" ref={wrapRef}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`relative w-full text-left px-4 py-3 border rounded-lg dark:bg-gray-700 pr-10 ${className}`}
      >
        <span className={selectedLabel ? "text-current" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          ▾
        </span>
      </button>

      {open && (
        <div className="relative">
          <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${value === opt.value ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
