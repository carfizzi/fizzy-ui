# Collapsible

> Shows and hides one section of content.

`npx fizzy-ui add collapsible` copies `collapsible.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_COLLAPSIBLE } from './ui/collapsible';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_COLLAPSIBLE, FZ_BUTTON],
  template: `
    <div fzCollapsible [(open)]="open" class="w-full max-w-sm text-sm">
      <div class="flex items-center justify-between gap-4">
        <p class="font-medium">3 starred repositories</p>
        <button fzButton fzCollapsibleTrigger variant="ghost" icon aria-label="Show all repositories">
          <svg viewBox="0 0 24 24" class="size-4 transition-transform duration-(--fz-duration-popup) ease-spring in-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div class="mt-2 rounded-md border px-4 py-2 font-mono">angular/angular</div>
      <fz-collapsible-content>
        <div class="mt-2 rounded-md border px-4 py-2 font-mono">angular/components</div>
        <div class="mt-2 rounded-md border px-4 py-2 font-mono">tailwindlabs/tailwindcss</div>
      </fz-collapsible-content>
    </div>
  `,
})
export class Demo {
  protected readonly open = signal(false);
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Open or close |

## Accessibility

- A disclosure: the trigger is a button with aria-expanded and aria-controls.
- Closed content is inert, so it is out of the tab order and hidden from screen readers.
- An icon-only trigger needs an aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/collapsible.ts (the file `add` copies; its doc comments describe the inputs)
