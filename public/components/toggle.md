# Toggle

> A button that stays on or off.

`npx fizzy-ui add toggle` copies `toggle.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `toggle-group`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_TOGGLE } from './ui/toggle';

@Component({
  imports: [FZ_TOGGLE],
  template: `
    <div class="flex items-center gap-2">
      <button fzToggle [(pressed)]="bold" aria-label="Bold"><b>B</b></button>
      <button fzToggle variant="outline" [(pressed)]="italic" aria-label="Italic"><i>I</i></button>
      <button fzToggle disabled aria-label="Underline"><u>U</u></button>
      <span class="ml-2 text-sm text-muted-foreground">Bold: {{ bold() }}, italic: {{ italic() }}</span>
    </div>
  `,
})
export class Demo {
  protected readonly bold = signal(false);
  protected readonly italic = signal(true);
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Turn on or off |

## Accessibility

- A native <button> with aria-pressed.
- An icon-only toggle needs an aria-label that does not change with the state.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/toggle.ts (the file `add` copies; its doc comments describe the inputs)
