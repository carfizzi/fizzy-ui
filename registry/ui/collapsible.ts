import { Component, Directive, booleanAttribute, inject, input, model } from '@angular/core';

let nextId = 0;

/**
 * Shows and hides one section: `<div fzCollapsible [(open)]="open">` with your own
 * `<button fzCollapsibleTrigger>` and `<fz-collapsible-content>`. A disclosure: the button has
 * `aria-expanded` and `aria-controls`; closed content is inert. For several sections, use accordion.
 */
@Directive({ selector: '[fzCollapsible]', exportAs: 'fzCollapsible', host: { class: 'block' } })
export class FzCollapsible {
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly contentId = `fz-collapsible-${nextId++}`;

  toggle() {
    if (!this.disabled()) this.open.update((o) => !o);
  }
}

/** The button that opens and closes it. Style a chevron with `in-aria-expanded:rotate-180`. */
@Directive({
  selector: 'button[fzCollapsibleTrigger]',
  host: {
    type: 'button',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.aria-controls]': 'collapsible.contentId',
    '[disabled]': 'collapsible.disabled()',
    '(click)': 'collapsible.toggle()',
  },
})
export class FzCollapsibleTrigger {
  protected readonly collapsible = inject(FzCollapsible);
}

@Component({
  selector: 'fz-collapsible-content',
  host: {
    '[id]': 'collapsible.contentId',
    '[inert]': '!collapsible.open()',
    // Height animates through grid rows (0fr <-> 1fr), as in the accordion.
    class:
      'grid grid-rows-[1fr] transition-[grid-template-rows] duration-(--fz-duration-popup) ease-spring motion-reduce:transition-none ' +
      '[&[inert]]:grid-rows-[0fr]',
  },
  // overflow-hidden clips during the animation: -mx-1 px-1 leaves room for focus rings.
  template: `<div class="-mx-1 min-h-0 overflow-hidden px-1"><ng-content /></div>`,
})
export class FzCollapsibleContent {
  protected readonly collapsible = inject(FzCollapsible);
}

export const FZ_COLLAPSIBLE = [FzCollapsible, FzCollapsibleTrigger, FzCollapsibleContent] as const;
