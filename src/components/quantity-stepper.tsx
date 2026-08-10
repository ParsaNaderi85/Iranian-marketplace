export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(quantity - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        disabled={quantity <= min}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        +
      </button>
    </div>
  );
}
