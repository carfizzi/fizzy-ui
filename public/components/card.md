# Card

> A bordered container with header, content and footer slots.

`npx fizzy-ui add card` copies `card.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_CARD } from './ui/card';
import { FZ_BUTTON } from './ui/button';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_CARD, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <form fzCard class="w-full max-w-sm">
      <div fzCardHeader>
        <h3 fzCardTitle>Contact</h3>
        <p fzCardDescription>We reply within a day.</p>
      </div>
      <div fzCardContent class="flex flex-col gap-2">
        <label fzLabel for="card-email">Email</label>
        <input fzInput id="card-email" type="email" placeholder="you@example.com" />
      </div>
      <div fzCardFooter class="justify-end">
        <button fzButton type="button" variant="outline">Cancel</button>
        <button fzButton type="button">Send</button>
      </div>
    </form>
  `,
})
export class Demo {}
```

## Accessibility

- Pick the title element (h2, h3…) that fits the page outline.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/card.ts (the file `add` copies; its doc comments describe the inputs)
