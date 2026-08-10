"use client";

import { useState, useId } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={id}
        aria-label="More information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full start-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-md bg-zinc-900 px-3 py-2 text-xs font-normal text-white shadow-lg rtl:translate-x-1/2 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {text}
        </span>
      )}
    </span>
  );
}
