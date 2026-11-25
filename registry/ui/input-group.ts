import { Directive, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * An input with text, icons or buttons inside its border:
 * `<div fzInputGroup><span fzInputGroupAddon>https://</span><input fzInputGroupInput aria-label="Site" /></div>`.
 * Addons go before or after the input. Text in an addon is not read with the input: put units or
 * prefixes that matter in the label too. Works inside `fzField` (the inner input is the control).
 */
@Directive({
  selector: '[fzInputGroup]',
  host: {
    '[attr.data-size]': 'size() ?? null',
    class:
      'flex h-(--fz-h) w-full min-w-0 items-center rounded-md border bg-background text-(length:--fz-text) shadow-xs transition-colors ' +
      'focus-within:ring-2 focus-within:ring-ring has-[[aria-invalid=true]]:border-destructive has-[input:disabled]:opacity-50',
  },
})
export class FzInputGroup {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

@Directive({
  selector: '[fzInputGroupAddon]',
  host: { class: 'flex h-full shrink-0 items-center gap-1 px-(--fz-field-px) text-muted-foreground has-[>button]:px-1 [&>svg]:size-4' },
})
export class FzInputGroupAddon {}

@Directive({
  selector: 'input[fzInputGroupInput]',
  host: {
    class:
      'h-full min-w-0 flex-1 bg-transparent px-(--fz-field-px) outline-none placeholder:text-muted-foreground not-first:ps-0 not-last:pe-0 ' +
      'disabled:cursor-not-allowed',
  },
})
export class FzInputGroupInput {}

export const FZ_INPUT_GROUP = [FzInputGroup, FzInputGroupAddon, FzInputGroupInput] as const;
