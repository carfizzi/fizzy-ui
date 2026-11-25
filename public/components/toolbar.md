# Toolbar

> A row of buttons, toggles and toggle groups with one Tab stop.

`npx fizzy-ui add toolbar` copies `toolbar.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_TOOLBAR } from './ui/toolbar';
import { FZ_SEPARATOR } from './ui/separator';

@Component({
  imports: [FZ_TOOLBAR, FZ_SEPARATOR],
  template: `
    <div class="flex flex-col items-start gap-2">
      <div fzToolbar aria-label="Text formatting">
        <button fzToolbarItem [(pressed)]="bold" aria-label="Bold"><b>B</b></button>
        <button fzToolbarItem [(pressed)]="italic" aria-label="Italic"><i>I</i></button>
        <div fzSeparator orientation="vertical" class="mx-1 h-5!"></div>
        <div fzToolbarGroup [(value)]="align" aria-label="Alignment">
          <button fzToolbarItem value="left">Left</button>
          <button fzToolbarItem value="center">Center</button>
          <button fzToolbarItem value="right">Right</button>
        </div>
        <div fzSeparator orientation="vertical" class="mx-1 h-5!"></div>
        <button fzToolbarItem [disabled]="true">Share</button>
      </div>
      <p class="text-sm text-muted-foreground">Bold: {{ bold() }}, italic: {{ italic() }}, align: {{ align() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly bold = signal(false);
  protected readonly italic = signal(false);
  protected readonly align = signal('left');
}
```

## Keyboard

| Key | Action |
|---|---|
| ← / → | Move between items |
| ↑ / ↓ | Move inside a toggle group |
| Home / End | First or last item |
| Enter / Space | Activate or toggle |

## Accessibility

- Toggles expose aria-pressed; a group is a radiogroup with aria-checked.
- Give the toolbar and each group an aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/toolbar.ts (the file `add` copies; its doc comments describe the inputs)
