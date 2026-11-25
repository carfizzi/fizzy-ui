# Textarea

> A styled native multi-line input.

`npx fizzy-ui add textarea` copies `textarea.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_TEXTAREA } from './ui/textarea';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_TEXTAREA, FZ_LABEL],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <label fzLabel for="demo-message">Message</label>
      <textarea fzTextarea id="demo-message" placeholder="Type your message here."></textarea>
    </div>
  `,
})
export class Demo {}
```

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/textarea.ts (the file `add` copies; its doc comments describe the inputs)
