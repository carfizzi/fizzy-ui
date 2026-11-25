# Sheet

> A dialog docked to an edge of the screen.

`npx fizzy-ui add sheet` copies `dialog.ts` into `src/app/ui/` and installs `@angular/cdk`. The same file holds `dialog`, `alert-dialog`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_DIALOG } from './ui/dialog';
import { FZ_BUTTON } from './ui/button';
import { FZ_SWITCH } from './ui/switch';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON, FZ_SWITCH],
  template: `
    <button fzButton variant="outline" (click)="sheet.open()">Open settings</button>
    <ng-template fzDialog side="right" #sheet="fzDialog">
      <h2 fzDialogTitle>Settings</h2>
      <p class="text-sm text-muted-foreground">A sheet is a dialog docked to an edge: side is left, right, top or bottom.</p>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" fzSwitch /> Notifications</label>
      <button fzButton variant="outline" fzDialogClose class="mt-auto">Close</button>
    </ng-template>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Tab / Shift+Tab | Cycle focus inside the sheet |
| Escape | Close and return focus |

## Accessibility

- Same as Dialog: fzDialogTitle names it.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/dialog.ts (the file `add` copies; its doc comments describe the inputs)
