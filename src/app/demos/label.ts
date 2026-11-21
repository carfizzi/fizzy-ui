import { Component } from '@angular/core';
import { FZ_LABEL } from '../../../registry/ui/label';
import { FZ_CHECKBOX } from '../../../registry/ui/checkbox';

@Component({
  imports: [FZ_LABEL, FZ_CHECKBOX],
  template: `
    <div class="flex items-center gap-2">
      <input type="checkbox" fzCheckbox id="demo-terms" />
      <label fzLabel for="demo-terms">Accept terms and conditions</label>
    </div>
  `,
})
export class Demo {}
