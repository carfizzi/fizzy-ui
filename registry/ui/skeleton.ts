import { Directive } from '@angular/core';

/** Purely visual. Put `aria-busy="true"` on the region that is loading. */
@Directive({
  selector: '[fzSkeleton]',
  host: { 'aria-hidden': 'true', class: 'block animate-pulse rounded-md bg-muted' },
})
export class FzSkeleton {}

export const FZ_SKELETON = [FzSkeleton] as const;
