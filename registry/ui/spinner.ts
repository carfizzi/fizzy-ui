import { Component, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * A loading indicator: `<fz-spinner />`, or `<fz-spinner label="Saving" class="size-6" />`.
 * A `status` region with hidden text, so screen readers say "Loading" when it appears. It takes
 * the text color; size it with `size` (xs–lg), or let it follow its container (a button's size). Under Reduce Motion it pulses instead of spinning.
 */
@Component({
  selector: 'fz-spinner',
  host: { role: 'status', class: 'inline-block size-(--fz-spinner) shrink-0 text-muted-foreground', '[attr.data-size]': 'size() ?? null' },
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
  /** xs, sm, md, lg (its own scale in fizzy.css). Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

export const FZ_SPINNER = [FzSpinner] as const;
