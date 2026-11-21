import { Component } from '@angular/core';
import { FZ_SKELETON } from '../../../registry/ui/skeleton';

@Component({
  imports: [FZ_SKELETON],
  template: `
    <div class="flex items-center gap-4" role="status" aria-busy="true" aria-label="Loading profile">
      <div fzSkeleton class="size-10 rounded-full"></div>
      <div class="flex flex-col gap-2">
        <div fzSkeleton class="h-4 w-40"></div>
        <div fzSkeleton class="h-4 w-28"></div>
      </div>
    </div>
  `,
})
export class Demo {}
