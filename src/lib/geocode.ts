// Free geocoding via OpenStreetMap's Nominatim. Best-effort only — callers
// should treat a null result as "no map pin available" rather than an error.
export async function geocodeAddress(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "iranian-marketplace-dev (contact: admin@example.com)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}
