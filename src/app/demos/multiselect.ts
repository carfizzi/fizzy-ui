import { Component, signal } from '@angular/core';
import { FZ_MULTISELECT } from '../../../registry/ui/select';

@Component({
  imports: [FZ_MULTISELECT],
  template: `
    <div class="flex flex-col gap-2">
      <span id="toppings-label" class="text-sm font-medium">Toppings</span>
      <fz-multiselect [(value)]="toppings" placeholder="Pick toppings" aria-labelledby="toppings-label" class="w-56">
        <fz-select-item value="cheese" label="Cheese" />
        <fz-select-item value="mushrooms" label="Mushrooms" />
        <fz-select-item value="olives" label="Olives" />
        <fz-select-item value="pineapple" label="Pineapple (sold out)" disabled />
        <fz-select-item value="basil" label="Basil" />
      </fz-multiselect>
      <p class="text-sm text-muted-foreground">Value: {{ toppings().join(', ') || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly toppings = signal<string[]>(['cheese']);
}
