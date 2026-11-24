import { Component, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * An icon button that closes something: `<button fzCloseButton (click)="…">`. Its name is "Close";
 * say what it closes when there is more than one (`aria-label="Close notification"`).
 */
@Component({
  selector: 'button[fzCloseButton]',
  host: {
    type: 'button',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-size]': 'size() ?? null',
    class:
      'inline-flex size-(--fz-h) shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors outline-none ' +
      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  },
  template: `<svg viewBox="0 0 16 16" class="size-4" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>`,
})
export class FzCloseButton {
  readonly ariaLabel = input('Close', { alias: 'aria-label' });
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

export const FZ_CLOSE_BUTTON = [FzCloseButton] as const;
