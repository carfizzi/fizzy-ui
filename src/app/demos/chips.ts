import { Component, signal } from '@angular/core';
import { FZ_CHIPS } from '../../../registry/ui/chips';
import { FZ_FIELD } from '../../../registry/ui/field';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_CHIPS, FZ_FIELD, FZ_LABEL],
  template: `
    <div class="grid w-full max-w-md gap-6 text-sm">
      <div class="grid gap-2">
        <fz-chip-listbox multiple [(value)]="diet" aria-label="Diet">
          <fz-chip value="vegetarian" label="Vegetarian" />
          <fz-chip value="vegan" label="Vegan" />
          <fz-chip value="gluten-free" label="Gluten-free" />
          <fz-chip value="halal" label="Halal" disabled />
        </fz-chip-listbox>
        <p class="text-muted-foreground">Diet: {{ diet().join(', ') || 'none' }}</p>
      </div>
      <div fzField>
        <label fzLabel>Tags</label>
        <fz-chip-input [(value)]="tags" placeholder="Add a tag…" />
        <p fzFieldDescription>Press Enter or a comma to add one.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly diet = signal(['vegetarian']);
  protected readonly tags = signal(['angular', 'a11y']);
}
