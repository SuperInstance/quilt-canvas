// viridis.ts — the perceptually-uniform Viridis colormap, zero deps.
// Control points from matplotlib's viridis (9-stop, 0-255); linear interp in RGB.
// Used as the tone ramp for dial→color projection (chiaroscuro:glyph lineage).

const STOPS: ReadonlyArray<readonly [number, number, number]> = [
  [68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142],
  [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map t in [0,1] to a viridis color; clamps outside the range. */
export function viridis(t: number): readonly [number, number, number] {
  const x = Math.min(1, Math.max(0, t));
  const scaled = x * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
}

/** CSS rgb() string for a normalized dial value. */
export function viridisCss(t: number): string {
  const [r, g, b] = viridis(t);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
