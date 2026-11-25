// Colors of the theme tokens: `oklch(L C H [/ a])` or `#rrggbb`. Used by the theme editor and by
// scripts/themes.test.mjs (Node imports this file as is: keep it plain TS, no imports).

type Rgb = [number, number, number]; // linear sRGB, 0..1

/** Linear sRGB of a token value, clipped to the sRGB gamut. Alpha is ignored. */
export function linearRgb(color: string): Rgb {
  const c = color.trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(c);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255)) as Rgb;
  }
  const ok = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/i.exec(c);
  if (!ok) throw new Error(`not an oklch() or #hex color: ${color}`);
  const L = Number(ok[1]) / (ok[2] ? 100 : 1);
  const C = Number(ok[3]);
  const h = (Number(ok[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  // OKLab -> LMS -> linear sRGB (Björn Ottosson)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v))) as Rgb;
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** `#rrggbb` for a color input. */
export function toHex(color: string) {
  return '#' + linearRgb(color).map((v) => Math.round(toGamma(v) * 255).toString(16).padStart(2, '0')).join('');
}

/** WCAG 2 contrast ratio (1 to 21). */
export function contrast(a: string, b: string) {
  const y = (c: string) => {
    const [r, g, bl] = linearRgb(c);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [y(a), y(b)].sort((x, z) => z - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Text on a background, as the components use the tokens: [text, background, minimum ratio]. */
export const PAIRS: [string, string, number][] = [
  ['foreground', 'background', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'muted', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['destructive-foreground', 'destructive', 4.5],
  ['destructive', 'background', 4.5], // error text
  ['ring', 'background', 3], // focus ring: a non-text contrast
];

/** The color tokens of a `:root { … }` / `.dark { … }` block of fizzy.css. */
export function tokensOf(css: string, selector: ':root' | '.dark') {
  const start = css.search(new RegExp(`(^|\\n)${selector.replace('.', '\\.')} \\{`));
  const block = css.slice(start, css.indexOf('}', start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([a-z-]+):\s*([^;]+);/g)) if (name !== 'radius' && !name.startsWith('fz-')) tokens[name] = value.trim();
  return tokens;
}
