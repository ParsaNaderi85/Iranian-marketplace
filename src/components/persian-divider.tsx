const colors = [
  "bg-persian-600",
  "bg-firoozeh-500",
  "bg-saffron-500",
  "bg-anar-500",
  "bg-banafsh-500",
];

// A repeating band of brand colors, evoking the striped borders common in
// Persian rugs and tilework — used as a divider between sections.
export function PersianDivider() {
  const tiles = [...colors, ...colors, ...colors, ...colors];
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {tiles.map((c, i) => (
        <span key={i} className={`h-full flex-1 ${c}`} />
      ))}
    </div>
  );
}
