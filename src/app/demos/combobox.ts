import { Component, signal } from '@angular/core';
import { FZ_COMBOBOX } from '../../../registry/ui/combobox';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_COMBOBOX, FZ_LABEL],
  template: `
    <div class="flex flex-col gap-2">
      <label fzLabel for="country">Country</label>
      <input id="country" fzCombobox [options]="countries" [(value)]="country" placeholder="Type a country" class="w-56!" />
      <p class="text-sm text-muted-foreground">Value: {{ country() || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly country = signal('');
  protected readonly countries = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'France', 'Germany', 'Iceland', 'Ireland', 'Italy', 'Japan', 'Norway', 'Portugal', 'Spain', 'Sweden'];
}
