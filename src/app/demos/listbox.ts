import { Component, signal } from '@angular/core';
import { FZ_LISTBOX } from '../../../registry/ui/listbox';

@Component({
  imports: [FZ_LISTBOX],
  template: `
    <div class="flex flex-col gap-2">
      <ul fzListbox multi selectionMode="explicit" [(value)]="fruits" aria-label="Fruits" class="w-56">
        @for (f of options; track f) {
          <li fzOption [value]="f" [label]="f">{{ f }}</li>
        }
      </ul>
      <p class="text-sm text-muted-foreground">Selected: {{ fruits().join(', ') || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly options = ['apple', 'banana', 'cherry', 'durian'];
  protected readonly fruits = signal<string[]>(['apple']);
}
