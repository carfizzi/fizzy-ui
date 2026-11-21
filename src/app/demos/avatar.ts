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
  `,
})
export class Demo {}
