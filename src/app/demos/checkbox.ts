import { Component, signal } from '@angular/core';
import { FZ_CHECKBOX } from '../../../registry/ui/checkbox';

@Component({
  imports: [FZ_CHECKBOX],
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <label class="flex items-center gap-2">
        <input type="checkbox" fzCheckbox [checked]="terms()" (change)="terms.set($any($event.target).checked)" /> Accept terms
      </label>
      <label class="flex items-center gap-2"><input type="checkbox" fzCheckbox [indeterminate]="true" /> Select all (mixed)</label>
      <label class="flex items-center gap-2"><input type="checkbox" fzCheckbox disabled /> Disabled</label>
      <p class="text-muted-foreground">Terms: {{ terms() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly terms = signal(true);
}
