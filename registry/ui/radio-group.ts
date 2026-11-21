import { Directive } from '@angular/core';

/**
 * `<div fzRadioGroup aria-label="…">` around native radios sharing a `name`:
 * `<label><input type="radio" fzRadio name="plan" value="pro"> Pro</label>`. The browser gives
 * one Tab stop, arrows that move the selection, and forms support.
 */
@Directive({
  selector: '[fzRadioGroup]',
  host: { role: 'radiogroup', class: 'grid gap-2 text-sm' },
})
export class FzRadioGroup {}

@Directive({
  selector: 'input[type=radio][fzRadio]',
  host: {
    class:
      'inline-grid size-4 shrink-0 cursor-pointer appearance-none place-content-center rounded-full border border-primary bg-background shadow-xs outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ' +
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive ' +
      "before:size-2 before:scale-0 before:rounded-full before:bg-primary before:content-[''] checked:before:scale-100",
  },
})
export class FzRadio {}

export const FZ_RADIO_GROUP = [FzRadioGroup, FzRadio] as const;
