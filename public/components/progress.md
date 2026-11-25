# Progress

> Shows how far a task has gone.

`npx fizzy-ui add progress` copies `progress.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_PROGRESS } from './ui/progress';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_PROGRESS, FZ_BUTTON],
  template: `
    <div class="grid w-full max-w-sm gap-4 text-sm">
      <label for="upload" class="flex justify-between">Uploading <span class="text-muted-foreground">{{ value() }}%</span></label>
      <progress fzProgress id="upload" [value]="value()" max="100"></progress>
      <button fzButton variant="outline" size="sm" class="w-fit" (click)="value.set((value() + 25) % 125)">Advance</button>
      <progress fzProgress aria-label="Loading"></progress>
    </div>
  `,
})
export class Demo {
  protected readonly value = signal(25);
}
```

## Accessibility

- A native <progress>: role, value and max come from the browser.
- Label it with aria-label or a <label for>.
- With no value it is indeterminate; under Reduce Motion it pulses instead of sweeping.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/progress.ts (the file `add` copies; its doc comments describe the inputs)
