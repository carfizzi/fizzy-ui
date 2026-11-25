# Input

> A styled native text input.

`npx fizzy-ui add input` copies `input.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_INPUT, FZ_LABEL],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-email">Email</label>
        <input fzInput id="demo-email" type="email" placeholder="you@example.com" />
      </div>
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-invalid">Invalid</label>
        <input fzInput id="demo-invalid" aria-invalid="true" value="not an email" />
      </div>
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-disabled">Disabled</label>
        <input fzInput id="demo-disabled" disabled value="Read only" />
      </div>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- Set aria-invalid="true" to show the error style; pair it with a visible message.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/input.ts (the file `add` copies; its doc comments describe the inputs)
