import { Component } from '@angular/core';
import { FZ_AVATAR } from '../../../registry/ui/avatar';

@Component({
  imports: [FZ_AVATAR],
  template: `
    <div class="flex gap-2">
      <fz-avatar src="https://github.com/angular.png" alt="Angular" fallback="NG" />
      <fz-avatar src="/missing.png" alt="Broken image" fallback="BI" />
      <fz-avatar alt="No image" fallback="NI" />
    </div>
    <div class="mt-4 flex items-center gap-2">
      @for (size of sizes; track size) {
        <fz-avatar [size]="size" alt="Ada Lovelace" fallback="AL" />
      }
    </div>
  `,
})
export class Demo {
  protected readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;
}
