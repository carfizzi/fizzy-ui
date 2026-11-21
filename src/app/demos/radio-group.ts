import { Component, signal } from '@angular/core';
import { FZ_RADIO_GROUP } from '../../../registry/ui/radio-group';

@Component({
  imports: [FZ_RADIO_GROUP],
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <div fzRadioGroup aria-label="Plan">
        @for (p of plans; track p) {
          <label class="flex items-center gap-2">
            <input type="radio" fzRadio name="plan" [value]="p" [checked]="plan() === p" (change)="plan.set(p)" /> {{ p }}
          </label>
        }
      </div>
      <p class="text-muted-foreground">Plan: {{ plan() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly plans = ['Free', 'Pro', 'Team'];
  protected readonly plan = signal('Pro');
}
