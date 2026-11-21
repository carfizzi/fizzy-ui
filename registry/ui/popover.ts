import { DestroyRef, Directive, ElementRef, Injector, afterNextRender, effect, inject, input, model, untracked } from '@angular/core';
import { DomPortal } from '@angular/cdk/portal';
import {
  ConnectedPosition,
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];
const FOCUSABLE = 'input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';
let nextId = 0;

/**
 * Non-modal popup: `<button fzButton [fzPopoverTrigger]="pop">` + `<div fzPopover #pop="fzPopover" aria-label="…">`.
 * Opening moves focus inside (first focusable, else the panel); Escape closes and gives focus back
 * to the trigger; a click outside or focus leaving closes it. `[(open)]` works too.
 */
@Directive({
  selector: '[fzPopover]',
  exportAs: 'fzPopover',
  host: {
    role: 'dialog',
    tabindex: '-1',
    '[id]': 'id()',
    '[class.hidden]': '!open()',
    '(keydown.escape)': 'close()',
    '(focusout)': 'onFocusOut($event)',
    '(document:pointerdown)': 'onOutside($event)',
    class: 'w-72 rounded-md border bg-background p-4 text-sm text-foreground shadow-md outline-none animate-fz-popup',
  },
})
export class FzPopover {
  readonly open = model(false);
  readonly id = input(`fz-popover-${nextId++}`);
  /** Set by `fzPopoverTrigger`: what the panel is placed against and gives focus back to. */
  anchor?: HTMLElement;
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private overlay?: OverlayRef;

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.attach() : this.overlay?.detach()));
    });
    inject(DestroyRef).onDestroy(() => this.overlay?.dispose());
  }

  toggle() {
    this.open.update((o) => !o);
  }

  close(restoreFocus = true) {
    if (!this.open()) return;
    this.open.set(false);
    if (restoreFocus) this.anchor?.focus();
  }

  private attach() {
    if (!this.anchor || this.overlay?.hasAttached()) return;
    this.overlay ??= createOverlayRef(this.injector, {
      usePopover: true,
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.anchor)
        .withPopoverLocation('inline')
        .withTransformOriginOn(':scope > .cdk-overlay-pane > *')
        .withPositions(POSITIONS),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlay.attach(new DomPortal(this.el));
    afterNextRender(() => (this.el.querySelector<HTMLElement>(FOCUSABLE) ?? this.el).focus(), { injector: this.injector });
  }

  private inside(node: EventTarget | null) {
    return node instanceof Node && (this.el.contains(node) || !!this.anchor?.contains(node));
  }

  protected onOutside(event: PointerEvent) {
    if (this.open() && !this.inside(event.target)) this.close(false);
  }

  // Tab out of the panel closes it. null means focus went nowhere in particular (e.g. a click on text).
  protected onFocusOut(event: FocusEvent) {
    if (event.relatedTarget && !this.inside(event.relatedTarget)) this.close(false);
  }
}

@Directive({
  selector: '[fzPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'fzPopoverTrigger().open()',
    '[attr.aria-controls]': 'fzPopoverTrigger().id()',
    '(click)': 'fzPopoverTrigger().toggle()',
  },
})
export class FzPopoverTrigger {
  readonly fzPopoverTrigger = input.required<FzPopover>();

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    effect(() => (this.fzPopoverTrigger().anchor = el));
  }
}

export const FZ_POPOVER = [FzPopover, FzPopoverTrigger] as const;
