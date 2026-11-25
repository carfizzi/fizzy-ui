import { Directive, input } from '@angular/core';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Buttons joined into one bar: `<div fzButtonGroup aria-label="Text alignment">` with `fzButton`s (or
 * inputs, selects). A `role="group"` with a name; Tab still visits each button. For arrow-key movement
 * between them, use a toolbar instead.
 */
@Directive({
  selector: '[fzButtonGroup]',
  host: {
    role: 'group',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-size]': 'size() ?? null',
    class:
      'inline-flex w-fit items-stretch [&>*]:relative [&>*:focus-visible]:z-10 ' +
      'data-[orientation=horizontal]:[&>*:not(:first-child)]:-ms-px data-[orientation=horizontal]:[&>*:not(:first-child)]:rounded-s-none data-[orientation=horizontal]:[&>*:not(:last-child)]:rounded-e-none ' +
      'data-[orientation=vertical]:flex-col data-[orientation=vertical]:[&>*:not(:first-child)]:-mt-px data-[orientation=vertical]:[&>*:not(:first-child)]:rounded-t-none data-[orientation=vertical]:[&>*:not(:last-child)]:rounded-b-none',
  },
})
export class FzButtonGroup {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** xs, sm, md, lg for every button inside. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
}

export const FZ_BUTTON_GROUP = [FzButtonGroup] as const;
