# Pagination

> Moves between pages of results.

`npx fizzy-ui add pagination` copies `pagination.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_PAGINATION } from './ui/pagination';

@Component({
  imports: [FZ_PAGINATION],
  template: `
    <div class="grid justify-items-center gap-3 text-sm">
      <fz-pagination [(page)]="page" [pageCount]="12" />
      <p class="text-muted-foreground">Page {{ page() }} of 12</p>
    </div>
  `,
})
export class Demo {
  protected readonly page = signal(5);
}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Move between the page buttons |
| Enter / Space | Go to that page |

## Accessibility

- A nav labelled "Pagination"; each page button is named "Page n" and the current one has aria-current="page".
- Previous and Next use aria-disabled at the ends, so they keep focus.

## Testing

`npx fizzy-ui add pagination --harness` also copies `pagination.harness.ts`, an Angular CDK test harness: `FzPaginationHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/pagination.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/pagination.ts (the file `add` copies; its doc comments describe the inputs)
