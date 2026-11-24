import { Directive, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

@Directive({
  selector: 'textarea[fzTextarea]',
  host: {
    '[attr.data-size]': 'size() ?? null',
    class:
      'flex min-h-16 w-full rounded-md border bg-background px-(--fz-field-px) py-2 text-(length:--fz-text) shadow-xs transition-colors outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
  },
})
export class FzTextarea {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

export const FZ_TEXTAREA = [FzTextarea] as const;
