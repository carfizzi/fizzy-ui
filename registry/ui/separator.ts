import { Directive, booleanAttribute, input } from '@angular/core';

/** Decorative by default (hidden from screen readers). Set `decorative="false"` when it separates content semantically. */
@Directive({
  selector: '[fzSeparator]',
  host: {
    '[attr.role]': 'decorative() ? "none" : "separator"',
    '[attr.aria-orientation]': '!decorative() && orientation() === "vertical" ? "vertical" : null',
    '[attr.data-orientation]': 'orientation()',
    class: 'block shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
  },
})
export class FzSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly decorative = input(true, { transform: booleanAttribute });
}

export const FZ_SEPARATOR = [FzSeparator] as const;
