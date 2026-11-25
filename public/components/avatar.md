# Avatar

> An image with a text fallback while it loads or when it fails.

`npx fizzy-ui add avatar` copies `avatar.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_AVATAR } from './ui/avatar';

@Component({
  imports: [FZ_AVATAR],
  template: `
    <div class="flex gap-2">
      <fz-avatar src="https://github.com/angular.png" alt="Angular" fallback="NG" />
      <fz-avatar src="/missing.png" alt="Broken image" fallback="BI" />
      <fz-avatar alt="No image" fallback="NI" />
    </div>
    <div class="mt-4 flex items-center gap-2">
      @for (size of sizes; track size) {
        <fz-avatar [size]="size" alt="Ada Lovelace" fallback="AL" />
      }
    </div>
  `,
})
export class Demo {
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;
}
```

## Accessibility

- Always pass alt: it labels the image and the fallback alike.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/avatar.ts (the file `add` copies; its doc comments describe the inputs)
