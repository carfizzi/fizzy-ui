import { Component, signal } from '@angular/core';
import { FZ_MENU } from '../../../registry/ui/menu';
import { FZ_BUTTON } from '../../../registry/ui/button';

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
