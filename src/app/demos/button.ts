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
      <button fzButton size="sm">Small</button>
      <button fzButton disabled>Disabled</button>
    </div>
  `,
})
export class Demo {}
