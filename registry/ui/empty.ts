import { Directive } from '@angular/core';

/**
 * What to show when there is nothing yet: `<div fzEmpty>` with an optional `fzEmptyMedia` (an icon),
 * a heading `fzEmptyTitle` at the level that fits your page, an `fzEmptyDescription` and actions.
 */
@Directive({
  selector: '[fzEmpty]',
  host: { class: 'flex w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center text-balance' },
})
export class FzEmpty {}

/** The icon: decorative, so mark the svg `aria-hidden="true"`. */
@Directive({
  selector: '[fzEmptyMedia]',
  host: { class: 'flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6' },
})
export class FzEmptyMedia {}

@Directive({ selector: '[fzEmptyTitle]', host: { class: 'text-lg font-semibold tracking-tight' } })
export class FzEmptyTitle {}

@Directive({ selector: '[fzEmptyDescription]', host: { class: '-mt-2 max-w-sm text-sm text-muted-foreground' } })
export class FzEmptyDescription {}

export const FZ_EMPTY = [FzEmpty, FzEmptyMedia, FzEmptyTitle, FzEmptyDescription] as const;
