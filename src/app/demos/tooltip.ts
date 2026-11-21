import { Component } from '@angular/core';
import { FZ_TOOLTIP } from '../../../registry/ui/tooltip';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_TOOLTIP, FZ_BUTTON],
  template: `<button fzButton variant="outline" fzTooltip="Copies the link to your clipboard">Hover or focus me</button>`,
})
export class Demo {}
