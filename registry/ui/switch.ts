import { Directive } from '@angular/core';

/**
 * An on/off switch on a native checkbox: `<input type="checkbox" fzSwitch>`. `role="switch"`
 * makes screen readers say on/off; checked state, Space, labels and forms stay native.
 */
@Directive({
  selector: 'input[type=checkbox][fzSwitch]',
  host: {
    role: 'switch',
    class:
      'inline-flex h-5 w-9 shrink-0 cursor-pointer appearance-none items-center rounded-full bg-muted-foreground/40 p-0.5 shadow-xs ' +
      'outline-none transition-colors checked:bg-primary ' +
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ' +
      "before:size-4 before:rounded-full before:bg-background before:shadow-sm before:transition-transform before:content-[''] " +
      'checked:before:translate-x-4 rtl:checked:before:-translate-x-4',
  },
})
export class FzSwitch {}

export const FZ_SWITCH = [FzSwitch] as const;
