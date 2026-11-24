import { Component, signal } from '@angular/core';
import { FZ_COLLAPSIBLE } from '../../../registry/ui/collapsible';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_COLLAPSIBLE, FZ_BUTTON],
  template: `
    <div fzCollapsible [(open)]="open" class="w-full max-w-sm text-sm">
      <div class="flex items-center justify-between gap-4">
        <p class="font-medium">3 starred repositories</p>
        <button fzButton fzCollapsibleTrigger variant="ghost" icon aria-label="Show all repositories">
          <svg viewBox="0 0 24 24" class="size-4 transition-transform duration-(--fz-duration-popup) ease-spring in-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div class="mt-2 rounded-md border px-4 py-2 font-mono">angular/angular</div>
      <fz-collapsible-content>
        <div class="mt-2 rounded-md border px-4 py-2 font-mono">angular/components</div>
        <div class="mt-2 rounded-md border px-4 py-2 font-mono">tailwindlabs/tailwindcss</div>
      </fz-collapsible-content>
    </div>
  `,
})
export class Demo {
  protected readonly open = signal(false);
}
