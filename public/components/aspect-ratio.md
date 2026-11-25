# Aspect ratio

> Keeps content at a width-to-height ratio.

`npx fizzy-ui add aspect-ratio` copies `aspect-ratio.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_ASPECT_RATIO } from './ui/aspect-ratio';

@Component({
  imports: [FZ_ASPECT_RATIO],
  template: `
    <div class="grid w-full max-w-md grid-cols-[2fr_1fr] items-start gap-4">
      <div fzAspectRatio="16 / 9" class="rounded-lg bg-linear-to-br from-muted to-accent">
        <div class="flex items-center justify-center text-sm text-muted-foreground">16 / 9</div>
      </div>
      <div [fzAspectRatio]="1" class="rounded-lg bg-linear-to-br from-muted to-accent">
        <div class="flex items-center justify-center text-sm text-muted-foreground">1 / 1</div>
      </div>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- Only layout: CSS aspect-ratio, nothing for assistive technology to read.
- An image inside still needs its alt text.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/aspect-ratio.ts (the file `add` copies; its doc comments describe the inputs)
