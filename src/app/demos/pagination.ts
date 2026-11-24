import { Component, signal } from '@angular/core';
import { FZ_PAGINATION } from '../../../registry/ui/pagination';

@Component({
  imports: [FZ_PAGINATION],
  template: `
    <div class="grid justify-items-center gap-3 text-sm">
      <fz-pagination [(page)]="page" [pageCount]="12" />
      <p class="text-muted-foreground">Page {{ page() }} of 12</p>
    </div>
  `,
})
export class Demo {
  protected readonly page = signal(5);
}
