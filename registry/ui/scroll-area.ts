import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal, viewChild } from '@angular/core';

/**
 * A scrolling box: `<fz-scroll-area class="h-72 rounded-md border" aria-label="Tags">…</fz-scroll-area>`.
 * Native scrolling (touch, wheel, keys, screen readers) with a thin scrollbar, and the edges fade where
 * there is more to see. While its content overflows, it is a Tab stop, so keyboard users can scroll it
 * with the arrows; give it a name and it becomes a `region` with that name. Size the host (`h-72`,
 * `max-h-72`, `w-96`); `orientation="horizontal"` scrolls sideways.
 */
@Component({
  selector: 'fz-scroll-area',
  // The viewport inside scrolls and takes the name; the host draws the focus ring (the fade masks the viewport's own).
  host: {
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    class: 'flex min-h-0 flex-col overflow-hidden has-[>[data-viewport]:focus-visible]:ring-2 has-[>[data-viewport]:focus-visible]:ring-ring',
  },
  template: `
    <div
      #viewport
      data-viewport
      [attr.data-orientation]="orientation()"
      [attr.tabindex]="overflows() ? 0 : null"
      [attr.role]="ariaLabel() || ariaLabelledby() ? 'region' : null"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledby() ?? null"
      [attr.data-more-start]="more()[0] || null"
      [attr.data-more-end]="more()[1] || null"
      class="min-h-0 flex-1 rounded-[inherit] outline-none [scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_transparent]
        data-[orientation=vertical]:overflow-y-auto data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden
        [--fz-fade-dir:to_bottom] data-[orientation=horizontal]:[--fz-fade-dir:to_right] [--fz-fade-start:0px] [--fz-fade-end:0px]
        data-more-start:[--fz-fade-start:1.5rem] data-more-end:[--fz-fade-end:1.5rem]
        [mask-image:linear-gradient(var(--fz-fade-dir),transparent,black_var(--fz-fade-start),black_calc(100%-var(--fz-fade-end)),transparent)]"
      (scroll)="measure()"
    >
      <div #content [class.w-max]="orientation() === 'horizontal'"><ng-content /></div>
    </div>
  `,
})
export class FzScrollArea {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  protected readonly overflows = signal(false);
  /** More content before / after what is visible. */
  protected readonly more = signal<[boolean, boolean]>([false, false], { equal: (a, b) => a[0] === b[0] && a[1] === b[1] }); // scroll fires often
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(this.viewport().nativeElement);
      observer.observe(this.content().nativeElement);
      destroy.onDestroy(() => observer.disconnect());
    });
  }

  protected measure() {
    const el = this.viewport().nativeElement;
    const [pos, size, total] =
      this.orientation() === 'horizontal' ? [el.scrollLeft, el.clientWidth, el.scrollWidth] : [el.scrollTop, el.clientHeight, el.scrollHeight];
    this.overflows.set(total > size + 1);
    this.more.set([pos > 1, pos + size < total - 1]);
  }
}

export const FZ_SCROLL_AREA = [FzScrollArea] as const;
