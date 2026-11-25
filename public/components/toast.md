# Toast

> A short notification that closes by itself.

`npx fizzy-ui add toast` copies `toast.ts` into `src/app/ui/` and installs `@angular/cdk`.

## Usage

```ts
import { Component, inject } from '@angular/core';
import { FzToaster } from './ui/toast';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_BUTTON],
  template: `
    <div class="flex flex-wrap gap-2">
      <button fzButton variant="outline" (click)="saved()">Save</button>
      <button fzButton variant="outline" (click)="deleted()">Delete</button>
      <button fzButton variant="outline" (click)="failed()">Fail</button>
    </div>
  `,
})
export class Demo {
  private readonly toaster = inject(FzToaster);

  protected saved() {
    this.toaster.show('Changes saved');
  }

  protected deleted() {
    this.toaster.show('File deleted', {
      description: 'report.pdf was moved to the trash.',
      action: { label: 'Undo', run: () => this.toaster.show('File restored') },
    });
  }

  protected failed() {
    this.toaster.show('Upload failed', { description: 'Check your connection and try again.', variant: 'destructive' });
  }
}
```

## Keyboard

| Key | Action |
|---|---|
| Alt + T | Move focus to the notifications |
| Tab | Move between their buttons |
| Escape | Dismiss the focused toast |

## Accessibility

- Each toast is announced through a live region: politely, or assertively for the destructive variant. Focus never moves on its own.
- Timers pause while the pointer or focus is on the toasts; closing a focused toast gives focus back to where it was.
- Whatever an action does must also be possible elsewhere in the page: a toast can close before someone reaches it.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/toast.ts (the file `add` copies; its doc comments describe the inputs)
