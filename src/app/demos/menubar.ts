import { Component, signal } from '@angular/core';
import { FZ_MENU, FZ_MENUBAR } from '../../../registry/ui/menu';

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
