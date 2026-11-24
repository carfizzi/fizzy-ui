import { Component } from '@angular/core';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_BUTTON],
  template: `
    <div class="flex flex-wrap gap-2">
      <button fzButton>Default</button>
      <button fzButton variant="secondary">Secondary</button>
      <button fzButton variant="outline">Outline</button>
      <button fzButton variant="ghost">Ghost</button>
      <button fzButton variant="destructive">Destructive</button>
      <button fzButton disabled>Disabled</button>
    </div>
    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button fzButton variant="outline" size="xs">Extra small</button>
      <button fzButton variant="outline" size="sm">Small</button>
      <button fzButton variant="outline">Medium</button>
      <button fzButton variant="outline" size="lg">Large</button>
      <button fzButton variant="outline" icon aria-label="Add">
        <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
      </button>
    </div>
  `,
})
export class Demo {}
