import { Directive } from '@angular/core';

/**
 * A styled native progress bar: `<progress fzProgress [value]="40" max="100" aria-label="Upload">`.
 * Role, value and `max` stay native. Without a value it is indeterminate: a sweeping bar, a pulse
 * under Reduce Motion. Label it (`aria-label`, or a `<label for>`).
 */
@Directive({
  selector: 'progress[fzProgress]',
  host: {
    class:
      'block h-2 w-full appearance-none overflow-hidden rounded-full border-0 bg-muted ' +
      '[&::-webkit-progress-bar]:bg-transparent ' +
      '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary ' +
      '[&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-(--fz-duration-control) [&::-webkit-progress-value]:ease-spring ' +
      '[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary ' +
      // indeterminate: no native bar, a gradient sweeps across instead (fz-indeterminate in the theme)
      'indeterminate:[&::-moz-progress-bar]:bg-transparent indeterminate:animate-fz-indeterminate indeterminate:bg-no-repeat ' +
      'indeterminate:bg-size-[40%_100%] indeterminate:bg-[linear-gradient(var(--color-primary),var(--color-primary))]',
  },
})
export class FzProgress {}

export const FZ_PROGRESS = [FzProgress] as const;
