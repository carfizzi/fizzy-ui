import { Directive, ElementRef, afterEveryRender, inject } from '@angular/core';

/**
 * A styled native range: `<input type="range" fzSlider min="0" max="100" aria-label="…">`.
 * Arrows, Page Up/Down, Home/End, `aria-valuenow` and forms stay native. The filled part of
 * the track follows the value through `--fz-fill`.
 */
@Directive({
  selector: 'input[type=range][fzSlider]',
  host: {
    '(input)': 'fill()',
    class:
      'h-5 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 ' +
      // Chrome / Safari: no progress pseudo, so the fill is a gradient on the track.
      // shortcut: the gradient runs left to right, so the fill is mirrored in RTL; add rtl: variants if needed.
      '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full ' +
      '[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-primary)_var(--fz-fill,0%),var(--color-muted)_var(--fz-fill,0%))] ' +
      '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
      '[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm ' +
      'focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-ring/50 ' +
      // Firefox
      '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted ' +
      '[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-primary ' +
      '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary ' +
      '[&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm ' +
      'focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-ring/50',
  },
})
export class FzSlider {
  private readonly el: HTMLInputElement = inject(ElementRef).nativeElement;

  constructor() {
    // Also catch values written by bindings or forms, which fire no input event.
    afterEveryRender(() => this.fill());
  }

  protected fill() {
    const min = this.el.min === '' ? 0 : +this.el.min;
    const max = this.el.max === '' ? 100 : +this.el.max;
    this.el.style.setProperty('--fz-fill', `${((+this.el.value - min) / (max - min || 1)) * 100}%`);
  }
}

export const FZ_SLIDER = [FzSlider] as const;
