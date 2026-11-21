import { Component, resource } from '@angular/core';
import { CodeBlock } from '../code-block';

@Component({
  imports: [CodeBlock],
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

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Dark mode</h2>
      <p>
        The <code class="rounded bg-muted px-1">.dark</code> block overrides the same variables. Put the class on
        <code class="rounded bg-muted px-1">&lt;html&gt;</code> to switch, as the toggle on this site does.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">The file</h2>
      @if (css.value(); as c) {
        <app-code-block [code]="c" label="fizzy.css" />
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
  protected readonly css = resource({
    loader: () => import('../../../registry/theme/fizzy.css', { with: { loader: 'text' } }).then((m) => m.default),
  });
}
