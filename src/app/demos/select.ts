import { Component, signal } from '@angular/core';
import { FZ_SELECT } from '../../../registry/ui/select';

@Component({
  imports: [FZ_SELECT],
  template: `
    <div class="flex flex-col gap-2">
      <span id="framework-label" class="text-sm font-medium">Framework</span>
      <fz-select [(value)]="framework" placeholder="Pick a framework" aria-labelledby="framework-label" class="w-56">
        <fz-select-item value="angular" label="Angular" />
        <fz-select-item value="react" label="React" />
        <fz-select-item value="vue" label="Vue" />
        <fz-select-item value="ember" label="Ember (disabled)" disabled />
        <fz-select-item value="svelte" label="Svelte" />
      </fz-select>
      <p class="text-sm text-muted-foreground">Value: {{ framework() ?? '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly framework = signal<string | undefined>(undefined);
}
