# Menubar

> A horizontal bar of menus, like a desktop app.

`npx fizzy-ui add menubar` copies `menu.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `menu`, `context-menu`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_MENU, FZ_MENUBAR } from './ui/menu';

@Component({
  imports: [FZ_MENU, FZ_MENUBAR],
  template: `
    <div class="flex flex-col items-start gap-2">
      <div fzMenubar aria-label="Editor" (itemSelected)="action.set($event)">
        <div fzMenuItem value="file" [submenu]="file.menu">File</div>
        <div fzMenuItem value="edit" [submenu]="edit.menu">Edit</div>
        <div fzMenuItem value="view" [submenu]="view.menu">View</div>
      </div>
      <div fzMenu #file="fzMenu">
        <div fzMenuItem value="new-tab">New tab</div>
        <div fzMenuItem value="new-window">New window</div>
        <div fzMenuSeparator></div>
        <div fzMenuItem value="print">Print…</div>
      </div>
      <div fzMenu #edit="fzMenu">
        <div fzMenuItem value="undo">Undo</div>
        <div fzMenuItem value="redo" [disabled]="true">Redo</div>
        <div fzMenuSeparator></div>
        <div fzMenuItem value="find" [submenu]="find.menu">Find</div>
      </div>
      <div fzMenu #find="fzMenu">
        <div fzMenuItem value="search-web">Search the web</div>
        <div fzMenuItem value="find-next">Find next</div>
      </div>
      <div fzMenu #view="fzMenu">
        <div fzMenuItem value="zoom-in">Zoom in</div>
        <div fzMenuItem value="zoom-out">Zoom out</div>
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
| → / ← | Move between menus |
| Enter / Space / ↓ | Open the menu |
| ↓ / ↑ | Move through items |
| Escape | Close the menu |

## Accessibility

- One Tab stop for the whole bar. Give it an aria-label.

## Testing

`npx fizzy-ui add menubar --harness` also copies `menu.harness.ts`, an Angular CDK test harness: `FzMenubarHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/menu.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/menu.ts (the file `add` copies; its doc comments describe the inputs)
