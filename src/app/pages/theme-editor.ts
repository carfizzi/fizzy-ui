import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { FZ_BADGE } from '../../../registry/ui/badge';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_CHECKBOX } from '../../../registry/ui/checkbox';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_SELECT } from '../../../registry/ui/select';
import { FZ_SLIDER } from '../../../registry/ui/slider';
import { FZ_SWITCH } from '../../../registry/ui/switch';
import presets from '../../../registry/theme/presets.json';
import { CodeBlock } from '../code-block';
import { PAIRS, contrast, toHex, tokensOf } from '../theme-color';

type Mode = 'light' | 'dark';
type Tokens = Record<string, string>;
const PRESETS = presets as Record<string, Record<Mode, Tokens>>;
const MODES: Mode[] = ['light', 'dark'];

/** Theming → Theme editor: a preset, the radius and every color token, previewed and checked; outputs the CSS. */
@Component({
  selector: 'app-theme-editor',
  imports: [CodeBlock, FZ_BADGE, FZ_BUTTON, FZ_CHECKBOX, FZ_INPUT, FZ_SELECT, FZ_SLIDER, FZ_SWITCH],
  template: `
    <div class="flex flex-col gap-6" data-theme-editor>
      <div class="flex flex-wrap items-end gap-6">
        <div class="flex flex-col gap-2">
          <span id="preset-label" class="text-sm font-medium">Preset</span>
          <fz-select [value]="preset()" (valueChange)="pick($event!)" aria-labelledby="preset-label" class="w-40! min-w-0!">
            @for (p of presetNames; track p) {
              <fz-select-item [value]="p" [label]="p" />
            }
          </fz-select>
        </div>
        <label class="flex flex-col gap-2 text-sm font-medium">
          Radius: {{ radius() }}rem
          <input type="range" fzSlider min="0" max="1.5" step="0.125" [value]="radius()" (input)="radius.set(+$any($event.target).value)" class="w-48!" />
        </label>
        <button fzButton variant="outline" size="sm" (click)="pick(preset())">Reset edits</button>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        @for (m of modes; track m) {
          <div [style]="previewStyle()[m]" class="flex flex-col gap-3 rounded-lg border bg-background p-4 text-foreground" [attr.data-preview]="m">
            <p class="text-sm font-medium">{{ m === 'light' ? 'Light' : 'Dark' }}</p>
            <div class="flex flex-wrap gap-2">
              <button fzButton size="sm">Primary</button>
              <button fzButton size="sm" variant="secondary">Secondary</button>
              <button fzButton size="sm" variant="outline">Outline</button>
              <button fzButton size="sm" variant="destructive">Delete</button>
            </div>
            <input fzInput size="sm" [attr.aria-label]="'Email, ' + m" placeholder="you@example.com" />
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <label class="flex items-center gap-2"><input type="checkbox" fzSwitch checked /> Switch</label>
              <label class="flex items-center gap-2"><input type="checkbox" fzCheckbox checked /> Check</label>
              <span fzBadge>Badge</span>
              <span class="rounded-md bg-muted px-2 py-1 text-muted-foreground">Muted</span>
            </div>
          </div>
        }
      </div>

      <div class="overflow-x-auto rounded-md border">
        <table class="w-full text-sm">
          <caption class="sr-only">Color tokens</caption>
          <thead class="bg-muted/50 text-start">
            <tr>
              <th scope="col" class="px-3 py-2 text-start font-medium">Token</th>
              <th scope="col" class="px-3 py-2 text-start font-medium">Light</th>
              <th scope="col" class="px-3 py-2 text-start font-medium">Dark</th>
            </tr>
          </thead>
          <tbody>
            @for (t of tokenNames(); track t) {
              <tr class="border-t">
                <th scope="row" class="px-3 py-1.5 text-start font-mono text-xs font-normal">--{{ t }}</th>
                @for (m of modes; track m) {
                  <td class="px-3 py-1.5">
                    <input
                      type="color"
                      [value]="hex()[m][t]"
                      (input)="edit(m, t, $any($event.target).value)"
                      [attr.aria-label]="t + ', ' + m"
                      class="h-7 w-12 cursor-pointer rounded border bg-transparent"
                    />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="font-semibold">Contrast</h3>
        <ul class="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2" data-contrast>
          @for (c of checks(); track c.label) {
            <li class="flex items-center justify-between gap-2">
              <span class="text-muted-foreground">{{ c.label }}</span>
              <span [class.text-destructive]="!c.ok" class="font-mono text-xs">{{ c.ratio }}:1 {{ c.ok ? 'passes' : 'fails' }}</span>
            </li>
          }
        </ul>
        <p class="text-xs text-muted-foreground">WCAG AA: 4.5:1 for text, 3:1 for the focus ring. Every preset passes; the site's tests check them.</p>
      </div>

      @if (css(); as code) {
        <p class="text-sm">Add this at the end of <code class="rounded bg-muted px-1">src/fizzy.css</code>; it overrides the defaults above it.</p>
        <app-code-block [code]="code" label="theme CSS" />
      } @else if (preset() !== 'neutral') {
        <app-code-block [code]="'npx fizzy-ui init --theme ' + preset()" label="theme command" />
      } @else {
        <p class="text-sm text-muted-foreground">These are the default tokens. Pick a preset or edit a color.</p>
      }
    </div>
  `,
})
export class ThemeEditor {
  /** fizzy.css, for the default tokens and radius. */
  readonly source = input.required<string>();
  protected readonly modes = MODES;
  protected readonly presetNames = Object.keys(PRESETS);
  private readonly defaults = computed(() => ({ light: tokensOf(this.source(), ':root'), dark: tokensOf(this.source(), '.dark') }));
  private readonly defaultRadius = computed(() => Number(/--radius:\s*([\d.]+)rem/.exec(this.source())?.[1] ?? 0.5));

  protected readonly preset = signal('neutral');
  protected readonly radius = linkedSignal(() => this.defaultRadius());
  private readonly edits = signal<Record<Mode, Tokens>>({ light: {}, dark: {} });

  protected readonly tokens = computed(() => {
    const p = PRESETS[this.preset()];
    return Object.fromEntries(MODES.map((m) => [m, { ...this.defaults()[m], ...p[m], ...this.edits()[m] }])) as Record<Mode, Tokens>;
  });
  protected readonly tokenNames = computed(() => Object.keys(this.defaults().light));
  protected readonly hex = computed(() => Object.fromEntries(MODES.map((m) => [m, Object.fromEntries(Object.entries(this.tokens()[m]).map(([k, v]) => [k, toHex(v)]))])) as Record<Mode, Tokens>);

  /** Each preview panel sets every token itself, so it does not follow the site's own light/dark. */
  protected readonly previewStyle = computed(() =>
    Object.fromEntries(
      MODES.map((m) => {
        const vars = Object.entries(this.tokens()[m]).flatMap(([k, v]) => [[`--${k}`, v], [`--color-${k}`, v]]); // --color-*: resolved on :root otherwise
        return [m, Object.fromEntries([...vars, ['--radius', `${this.radius()}rem`]])];
      }),
    ) as Record<Mode, Record<string, string>>,
  );

  protected readonly checks = computed(() =>
    MODES.flatMap((m) =>
      PAIRS.map(([fg, bg, min]) => {
        const ratio = contrast(this.tokens()[m][fg], this.tokens()[m][bg]);
        return { label: `${m}: ${fg} on ${bg}`, ratio: ratio.toFixed(1), ok: ratio >= min };
      }),
    ),
  );

  /** What differs from fizzy.css, as CSS to append; '' when a plain preset (use init --theme) or nothing changed. */
  protected readonly css = computed(() => {
    const edited = MODES.some((m) => Object.keys(this.edits()[m]).length) || this.radius() !== this.defaultRadius();
    if (!edited) return '';
    const blocks = MODES.map((m) => {
      const lines = Object.entries(this.tokens()[m])
        .filter(([k, v]) => v !== this.defaults()[m][k])
        .map(([k, v]) => `  --${k}: ${v};`);
      if (m === 'light' && this.radius() !== this.defaultRadius()) lines.unshift(`  --radius: ${this.radius()}rem;`);
      return lines.length ? `${m === 'light' ? ':root' : '.dark'} {\n${lines.join('\n')}\n}` : '';
    });
    return blocks.filter(Boolean).join('\n\n');
  });

  protected pick(name: string) {
    this.preset.set(name);
    this.edits.set({ light: {}, dark: {} });
    this.radius.set(this.defaultRadius());
  }

  protected edit(mode: Mode, token: string, value: string) {
    this.edits.update((e) => ({ ...e, [mode]: { ...e[mode], [token]: value } }));
  }
}
