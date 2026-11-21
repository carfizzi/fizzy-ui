import { Component, signal } from '@angular/core';
import { FZ_TOOLBAR } from '../../../registry/ui/toolbar';
import { FZ_SEPARATOR } from '../../../registry/ui/separator';

@Component({
  imports: [FZ_TOOLBAR, FZ_SEPARATOR],
  template: `
    <div class="flex flex-col items-start gap-2">
      <div fzToolbar aria-label="Text formatting">
        <button fzToolbarItem [(pressed)]="bold" aria-label="Bold"><b>B</b></button>
        <button fzToolbarItem [(pressed)]="italic" aria-label="Italic"><i>I</i></button>
        <div fzSeparator orientation="vertical" class="mx-1 h-5!"></div>
        <div fzToolbarGroup [(value)]="align" aria-label="Alignment">
          <button fzToolbarItem value="left">Left</button>
          <button fzToolbarItem value="center">Center</button>
          <button fzToolbarItem value="right">Right</button>
        </div>
        <div fzSeparator orientation="vertical" class="mx-1 h-5!"></div>
        <button fzToolbarItem [disabled]="true">Share</button>
      </div>
      <p class="text-sm text-muted-foreground">Bold: {{ bold() }}, italic: {{ italic() }}, align: {{ align() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly bold = signal(false);
  protected readonly italic = signal(false);
  protected readonly align = signal('left');
}
