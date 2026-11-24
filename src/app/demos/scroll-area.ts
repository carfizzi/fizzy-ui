import { Component } from '@angular/core';
import { FZ_SCROLL_AREA } from '../../../registry/ui/scroll-area';

@Component({
  imports: [FZ_SCROLL_AREA],
  template: `
    <div class="grid w-full max-w-md gap-6">
      <fz-scroll-area class="h-64 w-48 rounded-md border" aria-label="Releases">
        <div class="p-4">
          <p class="mb-3 text-sm font-medium">Releases</p>
          @for (v of versions; track v) {
            <div class="border-t py-2 text-sm first-of-type:border-t-0">v{{ v }}</div>
          }
        </div>
      </fz-scroll-area>
      <fz-scroll-area orientation="horizontal" class="w-full rounded-md border" aria-label="Colors">
        <div class="flex gap-3 p-4">
          @for (c of colors; track c) {
            <div class="flex h-24 w-32 shrink-0 items-end rounded-md bg-muted p-2 text-sm">{{ c }}</div>
          }
        </div>
      </fz-scroll-area>
    </div>
  `,
})
export class Demo {
  protected readonly versions = Array.from({ length: 30 }, (_, i) => `22.${29 - i}.0`);
  protected readonly colors = ['Slate', 'Stone', 'Red', 'Orange', 'Amber', 'Lime', 'Teal', 'Sky', 'Indigo', 'Rose'];
}
