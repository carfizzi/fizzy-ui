# Context menu

> A menu that opens on right click or the keyboard context-menu shortcut.

`npx fizzy-ui add context-menu` copies `menu.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `menu`, `menubar`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_CONTEXT_MENU, FZ_MENU } from './ui/menu';

@Component({
  imports: [FZ_MENU, FZ_CONTEXT_MENU],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <div
        [fzContextMenu]="ctxMenu"
        tabindex="0"
        class="flex h-28 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Right click here, or focus it and press the Menu key (Shift+F10 on Windows and Linux)
      </div>
      <div fzMenu #ctxMenu="fzMenu" (itemSelected)="action.set($event)">
        <div fzMenuItem value="back">Back</div>
        <div fzMenuItem value="reload">Reload</div>
        <div fzMenuSeparator></div>
        <div fzMenuItem value="inspect">Inspect</div>
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
| Menu key / Shift+F10 | Open on the focused area (the browser's contextmenu event) |
| ↓ / ↑ | Move through items |
| Enter / Space | Select |
| Escape | Close and return focus |

## Accessibility

- Make the area focusable (tabindex="0") so keyboard users can open the menu too.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/menu.ts (the file `add` copies; its doc comments describe the inputs)
