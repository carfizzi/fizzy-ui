# Hover card

> A preview of what a link leads to, on hover or keyboard focus.

`npx fizzy-ui add hover-card` copies `hover-card.ts` into `src/app/ui/` and installs `@angular/cdk`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_HOVER_CARD } from './ui/hover-card';
import { FZ_AVATAR } from './ui/avatar';

@Component({
  imports: [FZ_HOVER_CARD, FZ_AVATAR],
  template: `
    <p class="text-sm">
      Built on
      <a href="https://angular.dev" class="font-medium underline underline-offset-4" [fzHoverCardTrigger]="card">&#64;angular/aria</a>
      and the CDK.
    </p>
    <div fzHoverCard #card="fzHoverCard" class="flex gap-4">
      <fz-avatar alt="Angular" fallback="A" />
      <div class="grid gap-1">
        <p class="font-semibold">&#64;angular/aria</p>
        <p class="text-muted-foreground">Accessible, unstyled behavior for Angular components.</p>
        <a href="https://angular.dev/guide/aria/overview" class="w-fit text-xs underline underline-offset-4">Read the guide</a>
      </div>
    </div>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Focus the link to open it, then Tab into the card |
| Escape | Close it |

## Accessibility

- Opens on hover (after a delay) and at once on keyboard focus; the pointer can move onto it, and Escape closes it without moving pointer or focus (WCAG 1.4.13).
- Its DOM sits right after the link, so Tab reaches links inside it while it is open.
- Screen readers are not told about it and touch does not open it: it must only preview what the link leads to.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/hover-card.ts (the file `add` copies; its doc comments describe the inputs)
