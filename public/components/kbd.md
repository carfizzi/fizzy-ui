# Kbd

> A keyboard key, alone or in a combination.

`npx fizzy-ui add kbd` copies `kbd.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_KBD } from './ui/kbd';

@Component({
  imports: [FZ_KBD],
  template: `
    <div class="grid gap-3 text-sm">
      <p>Open the search with <kbd fzKbd><kbd fzKbd>Ctrl</kbd>+<kbd fzKbd>K</kbd></kbd>.</p>
      <p>
        On a Mac, <kbd fzKbd><kbd fzKbd><span aria-hidden="true">⌘</span><span class="sr-only">Command</span></kbd>+<kbd fzKbd>K</kbd></kbd>.
      </p>
      <p>Close it with <kbd fzKbd>Esc</kbd>.</p>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- A native <kbd>; a combination nests them, as the HTML spec describes.
- Screen readers read symbols literally (⌘ is "place of interest"): use words, or add visually hidden text.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/kbd.ts (the file `add` copies; its doc comments describe the inputs)
