import { Component } from '@angular/core';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_INPUT, FZ_LABEL],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-email">Email</label>
        <input fzInput id="demo-email" type="email" placeholder="you@example.com" />
      </div>
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-invalid">Invalid</label>
        <input fzInput id="demo-invalid" aria-invalid="true" value="not an email" />
      </div>
      <div class="flex flex-col gap-2">
        <label fzLabel for="demo-disabled">Disabled</label>
        <input fzInput id="demo-disabled" disabled value="Read only" />
      </div>
    </div>
  `,
})
export class Demo {}
