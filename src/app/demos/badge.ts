import { Component } from '@angular/core';
import { FZ_BADGE } from '../../../registry/ui/badge';

@Component({
  imports: [FZ_BADGE],
  template: `
    <div class="flex flex-wrap gap-2">
      <span fzBadge>Default</span>
      <span fzBadge variant="secondary">Secondary</span>
      <span fzBadge variant="outline">Outline</span>
      <span fzBadge variant="destructive">Destructive</span>
    </div>
  `,
})
export class Demo {}
