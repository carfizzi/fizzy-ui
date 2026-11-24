import { Directive } from '@angular/core';

/**
 * A styled native checkbox: `<input type="checkbox" fzCheckbox>`. Labels, forms (`ngModel`,
 * reactive and signal forms), Space and `[indeterminate]` all stay native.
 */
@Directive({
  selector: 'input[type=checkbox][fzCheckbox]',
  host: {
    class:
      'inline-grid size-4 shrink-0 cursor-pointer appearance-none place-content-center rounded-sm border border-primary bg-background shadow-xs outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ' +
      'checked:bg-primary indeterminate:bg-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive ' +
      // the mark: a clip-path tick (or a bar when indeterminate) in the foreground color
      "before:size-2.5 before:scale-0 before:opacity-0 before:bg-primary-foreground before:content-[''] " +
      // springs in; Reduce Motion keeps only the fade
      'before:transition-[scale,opacity] before:duration-(--fz-duration-control) before:ease-spring-snappy motion-reduce:before:scale-100 ' +
      'before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)] ' +
      'checked:before:scale-100 checked:before:opacity-100 indeterminate:before:scale-100 indeterminate:before:opacity-100 indeterminate:before:[clip-path:inset(40%_0)]',
  },
})
export class FzCheckbox {}

export const FZ_CHECKBOX = [FzCheckbox] as const;
