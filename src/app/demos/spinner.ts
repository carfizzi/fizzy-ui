import { Component } from '@angular/core';
import { FZ_SPINNER } from '../../../registry/ui/spinner';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_SPINNER, FZ_BUTTON],
  template: `
    <div class="flex items-center gap-6">
      <fz-spinner />
      <fz-spinner class="size-8 text-foreground" />
      <button fzButton disabled><fz-spinner label="Saving" class="text-current" /> Saving</button>
    </div>
  `,
})
export class Demo {}
