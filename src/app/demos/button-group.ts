import { Component, signal } from '@angular/core';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_BUTTON_GROUP } from '../../../registry/ui/button-group';
import { FZ_INPUT } from '../../../registry/ui/input';

@Component({
  imports: [FZ_BUTTON, FZ_BUTTON_GROUP, FZ_INPUT],
  template: `
    <div class="flex flex-wrap items-start gap-6">
      <div fzButtonGroup aria-label="History">
        <button fzButton variant="outline">Undo</button>
        <button fzButton variant="outline">Redo</button>
        <button fzButton variant="outline">History</button>
      </div>
      <div fzButtonGroup aria-label="Search the docs">
        <input fzInput aria-label="Search" placeholder="Search" class="w-40!" />
        <button fzButton variant="outline">Go</button>
      </div>
      <div fzButtonGroup orientation="vertical" size="sm" aria-label="Zoom">
        <button fzButton variant="outline" (click)="zoom.set(zoom() + 10)">Zoom in</button>
        <button fzButton variant="outline" (click)="zoom.set(zoom() - 10)">Zoom out</button>
      </div>
      <p class="text-sm text-muted-foreground" aria-live="polite">Zoom {{ zoom() }}%</p>
    </div>
  `,
})
export class Demo {
  protected readonly zoom = signal(100);
}
