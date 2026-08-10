"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 print:hidden"
    >
      {label}
    </button>
  );
}
