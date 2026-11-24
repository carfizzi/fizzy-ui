import { Directive, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

@Directive({
  selector: 'input[fzInput]',
  host: {
    '[attr.data-size]': 'size() ?? null',
    // our size, not the native one (a width in characters): keep the DOM attribute out
    '[attr.size]': 'null',
    class:
      'flex h-(--fz-h) w-full min-w-0 rounded-md border bg-background px-(--fz-field-px) py-1 text-(length:--fz-text) shadow-xs transition-colors outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive ' +
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  },
})
export class FzInput {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

export const FZ_INPUT = [FzInput] as const;
