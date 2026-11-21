import { Component, signal } from '@angular/core';
import { FZ_CONTEXT_MENU, FZ_MENU } from '../../../registry/ui/menu';

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
