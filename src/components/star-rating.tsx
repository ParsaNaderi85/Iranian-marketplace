export function StarRating({
  value,
  size = "text-base",
}: {
  value: number;
  size?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={`text-saffron-500 ${size}`} aria-label={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= rounded ? "★" : "☆"}</span>
      ))}
    </span>
  );
}
