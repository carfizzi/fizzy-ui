import { Component } from '@angular/core';
import { FZ_POPOVER } from '../../../registry/ui/popover';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_POPOVER, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <button fzButton variant="outline" [fzPopoverTrigger]="pop">Dimensions</button>
    <div fzPopover #pop="fzPopover" aria-label="Dimensions" class="flex flex-col gap-3">
      <p class="font-medium">Dimensions</p>
      <label fzLabel for="pop-width">Width</label>
      <input fzInput id="pop-width" value="100%" />
      <button fzButton size="sm" (click)="pop.close()">Apply</button>
    </div>
  `,
})
export class Demo {}
