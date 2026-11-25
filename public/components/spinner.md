# Spinner

> A small indicator that something is loading.

`npx fizzy-ui add spinner` copies `spinner.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_SPINNER } from './ui/spinner';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_SPINNER, FZ_BUTTON],
  template: `
    <div class="flex items-center gap-6">
      <fz-spinner />
      <fz-spinner size="lg" class="text-foreground" />
      <button fzButton disabled><fz-spinner label="Saving" class="text-current" /> Saving</button>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- A status region with hidden text (label, "Loading" by default), so it is announced when it appears.
- Inside a button, also set the button text or aria-busy so the button itself says what is happening.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/spinner.ts (the file `add` copies; its doc comments describe the inputs)
