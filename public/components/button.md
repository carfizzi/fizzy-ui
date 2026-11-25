# Button

> A native button or link with variants and sizes.

`npx fizzy-ui add button` copies `button.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_BUTTON],
  template: `
    <div class="flex flex-wrap gap-2">
      <button fzButton>Default</button>
      <button fzButton variant="secondary">Secondary</button>
      <button fzButton variant="outline">Outline</button>
      <button fzButton variant="ghost">Ghost</button>
      <button fzButton variant="destructive">Destructive</button>
      <button fzButton disabled>Disabled</button>
    </div>
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button fzButton variant="outline" size="xs">Extra small</button>
      <button fzButton variant="outline" size="sm">Small</button>
      <button fzButton variant="outline">Medium</button>
      <button fzButton variant="outline" size="lg">Large</button>
      <button fzButton variant="outline" icon aria-label="Add">
        <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
      </button>
    </div>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Activate |

## Accessibility

- Styles a native <button> or <a>, so focus, disabled and form behavior are the browser's own.
- An icon-only button needs an aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/button.ts (the file `add` copies; its doc comments describe the inputs)
