# Alert dialog

> A modal that asks to confirm an action.

`npx fizzy-ui add alert-dialog` copies `dialog.ts` into `src/app/ui/` and installs `@angular/cdk`. The same file holds `dialog`, `sheet`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_DIALOG } from './ui/dialog';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON],
  template: `
    <button fzButton variant="outline" (click)="dlg.open()">Delete account</button>
    <ng-template fzDialog role="alertdialog" #dlg="fzDialog">
      <h2 fzDialogTitle>Delete your account?</h2>
      <p fzDialogDescription>This cannot be undone. Your projects and settings will be removed.</p>
      <div class="flex justify-end gap-2">
        <button fzButton variant="outline" fzDialogClose cdkFocusInitial>Cancel</button>
        <button fzButton variant="destructive" [fzDialogClose]="true">Delete</button>
      </div>
    </ng-template>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Tab / Shift+Tab | Move between the buttons (focus stays inside) |
| Enter / Space | Press the focused button |
| Escape | Cancel |

## Accessibility

- role="alertdialog", named by its title and described by fzDialogDescription.
- A click outside does not close it: it waits for an answer. Escape cancels.
- Put cdkFocusInitial on the least destructive button (Cancel), so Enter never confirms by accident.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/dialog.ts (the file `add` copies; its doc comments describe the inputs)
