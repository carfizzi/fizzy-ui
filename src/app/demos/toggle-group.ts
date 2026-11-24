import { Component, signal } from '@angular/core';
import { FZ_TOGGLE_GROUP } from '../../../registry/ui/toggle';

@Component({
  imports: [FZ_TOGGLE_GROUP],
  template: `
    <div class="grid gap-4 text-sm">
      <div fzToggleGroup [(value)]="align" variant="outline" aria-label="Alignment">
        <button fzToggleGroupItem value="left">Left</button>
        <button fzToggleGroupItem value="center">Center</button>
        <button fzToggleGroupItem value="right">Right</button>
      </div>
      <div fzToggleGroup multiple [(value)]="style" aria-label="Text style">
        <button fzToggleGroupItem value="bold" aria-label="Bold"><b>B</b></button>
        <button fzToggleGroupItem value="italic" aria-label="Italic"><i>I</i></button>
        <button fzToggleGroupItem value="strike" aria-label="Strikethrough" [disabled]="true"><s>S</s></button>
      </div>
      <p class="text-muted-foreground">Align: {{ align() ?? 'none' }}, style: {{ style().join(', ') || 'none' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly align = signal<string | undefined>('left');
  protected readonly style = signal<string[]>(['bold']);
}
