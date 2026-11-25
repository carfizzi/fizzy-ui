# Badge

> A small label for status or counts.

`npx fizzy-ui add badge` copies `badge.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_BADGE } from './ui/badge';

@Component({
  imports: [FZ_BADGE],
  template: `
    <div class="flex flex-wrap gap-2">
      <span fzBadge>Default</span>
      <span fzBadge variant="secondary">Secondary</span>
      <span fzBadge variant="outline">Outline</span>
      <span fzBadge variant="destructive">Destructive</span>
    </div>
  `,
})
export class Demo {}
```

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/badge.ts (the file `add` copies; its doc comments describe the inputs)
