# List group

> A bordered list of rows, static or actionable.

`npx fizzy-ui add list-group` copies `list-group.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_LIST_GROUP } from './ui/list-group';

@Component({
  imports: [FZ_LIST_GROUP],
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <ul fzListGroup aria-label="Plan features">
        <li fzListGroupItem>Unlimited projects</li>
        <li fzListGroupItem>
          <div class="grid gap-0.5">
            <span class="font-medium">Priority support</span>
            <span class="text-muted-foreground">Answers within a day.</span>
          </div>
        </li>
        <li fzListGroupItem>Custom domains</li>
      </ul>
      <div fzListGroup role="group" aria-label="Folders">
        @for (f of folders; track f) {
          <button fzListGroupItem [attr.aria-current]="f === folder() || null" (click)="folder.set(f)">{{ f }}</button>
        }
        <button fzListGroupItem disabled>Archive</button>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly folders = ['Inbox', 'Drafts', 'Sent'];
  protected readonly folder = signal('Inbox');
}
```

## Accessibility

- Use a <ul> for static rows; links and buttons for rows you can act on (each its own Tab stop).
- Mark the current row with aria-current; it is styled from that attribute.
- Not a listbox: for picking options with the arrow keys, use listbox.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/list-group.ts (the file `add` copies; its doc comments describe the inputs)
