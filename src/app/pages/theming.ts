import { Component, resource, signal } from '@angular/core';
import { CodeBlock } from '../code-block';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_SELECT } from '../../../registry/ui/select';
import { FZ_INPUT_GROUP } from '../../../registry/ui/input-group';
import { FZ_TOGGLE, FZ_TOGGLE_GROUP } from '../../../registry/ui/toggle';
import { RtlExample } from './rtl-example';
import { ThemeEditor } from './theme-editor';

@Component({
  imports: [CodeBlock, RtlExample, ThemeEditor, FZ_BUTTON, FZ_INPUT, FZ_SELECT, FZ_INPUT_GROUP, FZ_TOGGLE, FZ_TOGGLE_GROUP],
  template: `
    <article class="flex max-w-2xl flex-col gap-6">
      <h1 class="text-3xl font-bold tracking-tight">Theming</h1>
      <p class="text-lg text-muted-foreground">Every color and radius is a CSS variable in one file you own.</p>
      <p>
        Components never use raw colors, only tokens such as <code class="rounded bg-muted px-1">bg-primary</code> or
        <code class="rounded bg-muted px-1">text-muted-foreground</code>. Change a variable in
        <code class="rounded bg-muted px-1">src/fizzy.css</code> and every component follows.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Tokens</h2>
      <ul class="grid gap-3 sm:grid-cols-2">
        @for (t of tokens; track t.name) {
          <li class="flex items-center gap-3">
            <span aria-hidden="true" class="size-8 shrink-0 rounded-md border" [class]="t.swatch"></span>
            <code class="text-sm">--{{ t.name }}</code>
          </li>
        }
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Presets and the theme editor</h2>
      <p>
        <code class="rounded bg-muted px-1">npx fizzy-ui init --theme blue</code> sets a color preset (neutral, blue, green, rose,
        violet, orange) in <code class="rounded bg-muted px-1">src/fizzy.css</code>, light and dark, and keeps your other edits.
        Or pick one here, change the radius or any color, and copy the CSS. Every preset meets WCAG AA contrast; the editor
        checks your colors as you go.
      </p>
      @if (css.hasValue()) {
        <app-theme-editor [source]="css.value()" />
      }

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Dark mode</h2>
      <p>
        The <code class="rounded bg-muted px-1">.dark</code> block overrides the same variables. Put the class on
        <code class="rounded bg-muted px-1">&lt;html&gt;</code> to switch, as the toggle on this site does.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Sizes</h2>
      <p>
        Controls come in four sizes, <code class="rounded bg-muted px-1">xs</code>, <code class="rounded bg-muted px-1">sm</code>,
        <code class="rounded bg-muted px-1">md</code> (the default) and <code class="rounded bg-muted px-1">lg</code>, from one scale in
        <code class="rounded bg-muted px-1">fizzy.css</code>, so controls of the same size line up. Set it on one component with
        <code class="rounded bg-muted px-1">size="sm"</code>, or on any container with <code class="rounded bg-muted px-1">data-size="sm"</code>:
        everything inside follows, like a density setting. The nearest one wins.
      </p>
      <div class="flex flex-col gap-4 rounded-lg border p-4">
        <div fzToggleGroup required [(value)]="size" size="sm" aria-label="Size">
          @for (s of sizes; track s) {
            <button fzToggleGroupItem [value]="s">{{ s }}</button>
          }
        </div>
        <div [attr.data-size]="size() ?? 'md'" class="flex flex-wrap items-center gap-2" data-sizes-example>
          <button fzButton>Save</button>
          <input fzInput aria-label="Name" placeholder="Name" class="w-36!" />
          <fz-select aria-label="Plan" placeholder="Plan" class="w-32! min-w-0!">
            <fz-select-item value="free" label="Free" />
            <fz-select-item value="pro" label="Pro" />
          </fz-select>
          <div fzInputGroup class="w-40!">
            <span fzInputGroupAddon>€</span>
            <input fzInputGroupInput aria-label="Price" value="12" />
          </div>
          <button fzToggle variant="outline" aria-label="Bold"><b>B</b></button>
        </div>
      </div>
      <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
        <li><code class="rounded bg-muted px-1">--fz-h</code> is the control height (28, 32, 36, 40px); <code class="rounded bg-muted px-1">--fz-px</code>, <code class="rounded bg-muted px-1">--fz-field-px</code> and <code class="rounded bg-muted px-1">--fz-text</code> the padding and text.</li>
        <li>Avatar, badge and spinner have their own scale under the same names. Dialogs, menus, tables and other containers have one size.</li>
        <li>xs stays above the 24px minimum pointer target (WCAG 2.5.8).</li>
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Motion</h2>
      <p>
        Panels open with Apple-style springs: brief, no bounce, never in the way. Dialogs and popups fade in and grow
        slightly from their trigger, sheets slide in from their edge, the accordion grows to its height and the switch
        thumb settles with a hint of bounce. Dialogs and sheets leave the way they came, a little faster;
        popups and tooltips fade out quickly, with focus already back on their trigger. Submenus, menubars and
        trees stay instant; the tab highlight slides and the checkbox mark springs in.
      </p>
      <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
        <li><code class="rounded bg-muted px-1">--fz-spring</code> and <code class="rounded bg-muted px-1">--fz-spring-snappy</code> are the curves (bounce 0 and 0.15).</li>
        <li><code class="rounded bg-muted px-1">--fz-duration-*</code> set the timing. Set one to <code class="rounded bg-muted px-1">0s</code> to turn that motion off.</li>
        <li>With Reduce Motion on, scale and slide become fades, bounce goes away and the accordion changes at once.</li>
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Right-to-left</h2>
      <p>
        Components use logical properties (start and end, not left and right), so they follow the text direction: rows,
        padding, borders, chevrons, the switch thumb, the slider fill, popups and the tab highlight all mirror. Set
        <code class="rounded bg-muted px-1">dir="rtl"</code> on <code class="rounded bg-muted px-1">&lt;html&gt;</code>. For one part of
        a page, import <code class="rounded bg-muted px-1">Dir</code> from <code class="rounded bg-muted px-1">&#64;angular/cdk/bidi</code>
        and put <code class="rounded bg-muted px-1">dir="rtl"</code> on its container, so the arrow keys and popups follow it too.
      </p>
      <div class="rounded-lg border p-4"><app-rtl-example /></div>
      <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
        <li>Arrow keys follow the direction: in a right-to-left tab list or toolbar, Left moves to the next item.</li>
        <li>A sheet's <code class="rounded bg-muted px-1">side</code> is physical (<code class="rounded bg-muted px-1">left</code>, <code class="rounded bg-muted px-1">right</code>): pick it from the direction.</li>
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">The file</h2>
      @if (css.hasValue()) {
        <app-code-block [code]="css.value()" label="fizzy.css" />
      }
    </article>
  `,
})
export class ThemingPage {
  // Literal class names: Tailwind only generates classes it finds in the source.
  protected readonly tokens = [
    { name: 'background', swatch: 'bg-background' },
    { name: 'foreground', swatch: 'bg-foreground' },
    { name: 'primary', swatch: 'bg-primary' },
    { name: 'primary-foreground', swatch: 'bg-primary-foreground' },
    { name: 'secondary', swatch: 'bg-secondary' },
    { name: 'muted', swatch: 'bg-muted' },
    { name: 'muted-foreground', swatch: 'bg-muted-foreground' },
    { name: 'accent', swatch: 'bg-accent' },
    { name: 'destructive', swatch: 'bg-destructive' },
    { name: 'border', swatch: 'bg-border' },
    { name: 'ring', swatch: 'bg-ring' },
  ];
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'];
  protected readonly size = signal<string | undefined>('md');
  protected readonly css = resource({
    loader: () => import('../../../registry/theme/fizzy.css', { with: { loader: 'text' } }).then((m) => m.default),
  });
}
