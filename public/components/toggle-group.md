# Toggle group

> A set of toggles: one choice, or several.

`npx fizzy-ui add toggle-group` copies `toggle.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `toggle`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_TOGGLE_GROUP } from './ui/toggle';

@Component({
  imports: [FZ_TOGGLE_GROUP],
  template: `
    <div class="grid gap-4 text-sm">
      <div fzToggleGroup [(value)]="align" variant="outline" aria-label="Alignment">
        <button fzToggleGroupItem value="left">Left</button>
        <button fzToggleGroupItem value="center">Center</button>
        <button fzToggleGroupItem value="right">Right</button>
      </div>
      <div fzToggleGroup multiple [(value)]="style" aria-label="Text style">
        <button fzToggleGroupItem value="bold" aria-label="Bold"><b>B</b></button>
        <button fzToggleGroupItem value="italic" aria-label="Italic"><i>I</i></button>
        <button fzToggleGroupItem value="strike" aria-label="Strikethrough" [disabled]="true"><s>S</s></button>
      </div>
      <p class="text-muted-foreground">Align: {{ align() ?? 'none' }}, style: {{ style().join(', ') || 'none' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly align = signal<string | undefined>('left');
  protected readonly style = signal<string[]>(['bold']);
}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Move into and out of the group |
| ← / → | Move between items |
| Home / End | First or last item |
| Enter / Space | Turn the focused item on or off |

## Accessibility

- A toolbar with one Tab stop; every item is a button with aria-pressed, in single and multiple mode.
- Give the group an aria-label.
- Disabled items stay focusable with the arrows but cannot be pressed.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/toggle.ts (the file `add` copies; its doc comments describe the inputs)
