# Popover

> Rich content in a panel anchored to a trigger.

`npx fizzy-ui add popover` copies `popover.ts` into `src/app/ui/` and installs `@angular/cdk`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_POPOVER } from './ui/popover';
import { FZ_BUTTON } from './ui/button';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_POPOVER, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <button fzButton variant="outline" [fzPopoverTrigger]="pop">Dimensions</button>
    <div fzPopover #pop="fzPopover" aria-label="Dimensions" class="flex flex-col gap-3">
      <p class="font-medium">Dimensions</p>
      <label fzLabel for="pop-width">Width</label>
      <input fzInput id="pop-width" value="100%" />
      <button fzButton size="sm" (click)="pop.close()">Apply</button>
    </div>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Open from the trigger; focus moves inside |
| Escape | Close and return focus |
| Tab out | Close |

## Accessibility

- The panel is a non-modal dialog: give it an aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/popover.ts (the file `add` copies; its doc comments describe the inputs)
