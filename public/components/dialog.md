# Dialog

> A modal window over the page, opened from an ng-template.

`npx fizzy-ui add dialog` copies `dialog.ts` into `src/app/ui/` and installs `@angular/cdk`. The same file holds `sheet`, `alert-dialog`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_DIALOG } from './ui/dialog';
import { FZ_BUTTON } from './ui/button';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <button fzButton variant="outline" (click)="dlg.open()">Edit profile</button>
    <ng-template fzDialog #dlg="fzDialog">
      <h2 fzDialogTitle>Edit profile</h2>
      <p fzDialogDescription>Make changes to your profile here.</p>
      <label fzLabel for="dlg-name">Name</label>
      <input fzInput id="dlg-name" value="Ada Lovelace" />
      <div class="flex justify-end gap-2">
        <button fzButton variant="outline" fzDialogClose>Cancel</button>
        <button fzButton fzDialogClose>Save</button>
      </div>
    </ng-template>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Tab / Shift+Tab | Cycle focus inside the dialog |
| Escape | Close and return focus to the opener |

## Accessibility

- fzDialogTitle is required: it names the dialog (aria-labelledby).
- The rest of the page gets aria-hidden while the dialog is open.

## Testing

`npx fizzy-ui add dialog --harness` also copies `dialog.harness.ts`, an Angular CDK test harness: `FzDialogHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/dialog.harness.ts). Dialogs render in an overlay: load it with `TestbedHarnessEnvironment.documentRootLoader(fixture)`.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/dialog.ts (the file `add` copies; its doc comments describe the inputs)
