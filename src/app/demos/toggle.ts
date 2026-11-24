import { Component, signal } from '@angular/core';
import { FZ_TOGGLE } from '../../../registry/ui/toggle';

@Component({
  imports: [FZ_TOGGLE],
  template: `
    <div class="flex items-center gap-2">
      <button fzToggle [(pressed)]="bold" aria-label="Bold"><b>B</b></button>
      <button fzToggle variant="outline" [(pressed)]="italic" aria-label="Italic"><i>I</i></button>
      <button fzToggle disabled aria-label="Underline"><u>U</u></button>
      <span class="ml-2 text-sm text-muted-foreground">Bold: {{ bold() }}, italic: {{ italic() }}</span>
    </div>
  `,
})
export class Demo {
  protected readonly bold = signal(false);
  protected readonly italic = signal(true);
}
