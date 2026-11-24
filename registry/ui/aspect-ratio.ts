import { Directive, input } from '@angular/core';

/**
 * Keeps its content at a ratio as the width changes: `<div fzAspectRatio="16 / 9"><img …></div>`.
 * The ratio is CSS `aspect-ratio` (a number or "w / h"); an image or video inside fills it, cropped.
 */
@Directive({
  selector: '[fzAspectRatio]',
  host: {
    '[style.aspect-ratio]': 'ratio()',
    class: 'relative block w-full overflow-hidden [&>*]:size-full [&>img]:object-cover [&>video]:object-cover',
  },
})
export class FzAspectRatio {
  readonly ratio = input<number | string>(1, { alias: 'fzAspectRatio' });
}

export const FZ_ASPECT_RATIO = [FzAspectRatio] as const;
