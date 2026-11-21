import { DOCUMENT, DestroyRef, Directive, ElementRef, Injector, effect, inject, input } from '@angular/core';
import { DomPortal } from '@angular/cdk/portal';
import { ConnectedPosition, OverlayRef, createFlexibleConnectedPositionStrategy, createOverlayRef } from '@angular/cdk/overlay';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
  { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
];
const SHOW_DELAY = 500;
const HIDE_DELAY = 100;
let nextId = 0;

/**
 * `<button fzTooltip="Copy to clipboard">`. Shows after a short hover or at once on keyboard
 * focus; hides on leave, blur or Escape. The text is the trigger's `aria-describedby`, so it is
 * announced as a description: give icon-only triggers an `aria-label` as well.
 */
@Directive({
  selector: '[fzTooltip]',
  host: {
    '(pointerenter)': 'show(SHOW_DELAY)',
    '(pointerleave)': 'hide(HIDE_DELAY)',
    '(focusin)': 'onFocus()',
    '(focusout)': 'hide(0)',
    '(document:keydown.escape)': 'hide(0)',
  },
})
export class FzTooltip {
  readonly fzTooltip = input.required<string>();
  protected readonly SHOW_DELAY = SHOW_DELAY;
  protected readonly HIDE_DELAY = HIDE_DELAY;
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly tip = inject(DOCUMENT).createElement('div');
  private overlay?: OverlayRef;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    const id = `fz-tooltip-${nextId++}`;
    Object.assign(this.tip, { id, role: 'tooltip', hidden: true });
    this.tip.className =
      'w-max max-w-xs rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md ' +
      'animate-fz-tooltip';
    // Hoverable (WCAG 1.4.13): moving the pointer onto the tooltip keeps it open.
    this.tip.addEventListener('pointerenter', () => clearTimeout(this.timer));
    this.tip.addEventListener('pointerleave', () => this.hide(HIDE_DELAY));
    // Kept next to the trigger while hidden so aria-describedby always resolves.
    this.host.after(this.tip);
    this.host.setAttribute('aria-describedby', [this.host.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    effect(() => (this.tip.textContent = this.fzTooltip()));
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.overlay?.dispose();
      this.tip.remove();
    });
  }

  protected onFocus() {
    if (this.host.matches(':focus-visible')) this.show(0);
  }

  protected show(delay: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.overlay?.hasAttached()) return;
      this.overlay ??= createOverlayRef(this.injector, {
        usePopover: true,
        positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.host)
          .withPopoverLocation('inline')
          .withPositions(POSITIONS),
      });
      this.tip.hidden = false;
      this.overlay.attach(new DomPortal(this.tip));
    }, delay);
  }

  protected hide(delay: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.overlay?.detach();
      this.tip.hidden = true;
    }, delay);
  }
}

export const FZ_TOOLTIP = [FzTooltip] as const;
