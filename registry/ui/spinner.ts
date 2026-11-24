import { Component, input } from '@angular/core';

/**
 * A loading indicator: `<fz-spinner />`, or `<fz-spinner label="Saving" class="size-6" />`.
 * A `status` region with hidden text, so screen readers say "Loading" when it appears. It takes
 * the text color; size it with `size-*`. Under Reduce Motion it pulses instead of spinning.
 */
@Component({
  selector: 'fz-spinner',
  host: { role: 'status', class: 'inline-block size-4 shrink-0 text-muted-foreground' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" class="size-full animate-spin motion-reduce:animate-pulse">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
    <span class="sr-only">{{ label() }}</span>
  `,
})
export class FzSpinner {
  readonly label = input('Loading');
}

export const FZ_SPINNER = [FzSpinner] as const;
