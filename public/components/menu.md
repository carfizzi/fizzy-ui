# Menu

> A dropdown menu of actions, with submenus.

`npx fizzy-ui add menu` copies `menu.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `menubar`, `context-menu`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_MENU } from './ui/menu';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_MENU, FZ_BUTTON],
  template: `
    <div class="flex flex-col items-start gap-2">
      <button fzButton variant="outline" [fzMenuTrigger]="fileMenu.menu">File</button>
      <div fzMenu #fileMenu="fzMenu" (itemSelected)="action.set($event)">
        <div fzMenuItem value="new">New file</div>
        <div fzMenuItem value="open">Open…</div>
        <div fzMenuItem value="share" [submenu]="shareMenu.menu">Share</div>
        <div fzMenuSeparator></div>
        <div fzMenuItem value="delete" [disabled]="true">Delete</div>
      </div>
      <div fzMenu #shareMenu="fzMenu" (itemSelected)="action.set($event)">
        <div fzMenuItem value="email">Email</div>
        <div fzMenuItem value="link">Copy link</div>
      </div>
      <p class="text-sm text-muted-foreground">Last action: {{ action() ?? '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly action = signal<unknown>(undefined);
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space / ↓ | Open from the trigger |
| ↓ / ↑ | Move through items |
| → / ← | Open or close a submenu |
| Type | Jump to an item by its text |
| Escape | Close and return focus |

## Accessibility

- Disabled items stay focusable but cannot be selected.

## Testing

`npx fizzy-ui add menu --harness` also copies `menu.harness.ts`, an Angular CDK test harness: `FzMenuHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/menu.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/menu.ts (the file `add` copies; its doc comments describe the inputs)
