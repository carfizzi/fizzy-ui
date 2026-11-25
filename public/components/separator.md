# Separator

> A horizontal or vertical divider.

`npx fizzy-ui add separator` copies `separator.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_SEPARATOR } from './ui/separator';

@Component({
  imports: [FZ_SEPARATOR],
  template: `
    <div class="w-full max-w-sm">
      <p class="text-sm font-medium">fizzy-ui</p>
      <p class="text-sm text-muted-foreground">Accessible Angular components.</p>
      <div fzSeparator class="my-4"></div>
      <div class="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <div fzSeparator orientation="vertical"></div>
        <span>Source</span>
      </div>
    </div>
  `,
})
export class Demo {}
```

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/separator.ts (the file `add` copies; its doc comments describe the inputs)
