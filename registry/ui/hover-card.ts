import { DestroyRef, Directive, ElementRef, Injector, effect, inject, input, signal, untracked } from '@angular/core';
import { DomPortal } from '@angular/cdk/portal';
import { ConnectedPosition, OverlayRef, createFlexibleConnectedPositionStrategy, createOverlayRef, createRepositionScrollStrategy } from '@angular/cdk/overlay';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
  { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
];

/**
 * Exit animation: marks `el` data-closing (its exit keyframes) and inert, then calls `done` once the
 * animations end. With none (motion off, or tests) it calls `done` at once and returns undefined;
 * otherwise it returns a cancel, for a reopen.
 */
function leave(el: HTMLElement, done: () => void): (() => void) | undefined {
  let live = true;
  const clear = () => {
    el.removeAttribute('data-closing');
    el.inert = false;
  };
  el.setAttribute('data-closing', '');
  el.inert = true;
  const running = el.getAnimations?.() ?? [];
  if (!running.length) {
    done();
    clear();
    return undefined;
  }
  void Promise.allSettled(running.map((a) => a.finished)).then(() => {
    if (!live) return;
    live = false;
    done();
    clear();
  });
  return () => {
    live = false;
    clear();
  };
}

/**
 * A preview card for sighted mouse and keyboard users: `<a href="…" [fzHoverCardTrigger]="card">` +
 * `<div fzHoverCard #card="fzHoverCard">`. Opens after a hover (`openDelay`) or at once on keyboard
 * focus; the pointer can move onto it; it closes when pointer and focus have both left, or on Escape.
 * Its DOM sits right after the trigger, so Tab goes into it while open. Touch does not open it, and
 * screen readers are not told about it: it must only repeat what the link leads to.
 */
@Directive({
  selector: '[fzHoverCard]',
  exportAs: 'fzHoverCard',
  host: {
    '[attr.data-open]': 'open()',
    '(pointerenter)': 'onPointer($event, true)',
    '(pointerleave)': 'onPointer($event, false)',
    '(focusout)': 'onFocusOut($event)',
    '(document:keydown.escape)': 'close()',
    class:
      'w-72 rounded-md border bg-background p-4 text-sm text-foreground shadow-md outline-none animate-fz-popup ' +
      'data-[open=false]:not-data-closing:hidden data-closing:animate-fz-fade-out',
  },
})
export class FzHoverCard {
  readonly openDelay = input(500);
  readonly closeDelay = input(300);
  readonly open = signal(false);
  /** Set by `fzHoverCardTrigger`. */
  anchor?: HTMLElement;
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private overlay?: OverlayRef;
  private leaving?: () => void;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.attach() : this.detach()));
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.overlay?.dispose();
    });
  }

  /** Opens or closes after `delay` ms; a later call replaces a pending one. */
  schedule(open: boolean, delay: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.open.set(open), delay);
  }

  close() {
    clearTimeout(this.timer);
    this.open.set(false);
  }

  inside(node: EventTarget | null) {
    return node instanceof Node && (this.el.contains(node) || !!this.anchor?.contains(node));
  }

  protected onPointer(event: PointerEvent, enter: boolean) {
    if (event.pointerType === 'touch') return;
    if (enter) clearTimeout(this.timer); // moved from the trigger onto the card: stay
    else this.schedule(false, this.closeDelay());
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.inside(event.relatedTarget)) this.close();
  }

  private attach() {
    this.leaving?.(); // reopened while closing
    this.leaving = undefined;
    if (!this.anchor) return;
    this.overlay ??= createOverlayRef(this.injector, {
      usePopover: true,
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.anchor)
        .withPopoverLocation('inline')
        .withTransformOriginOn(':scope > .cdk-overlay-pane > *')
        .withPositions(POSITIONS),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    if (!this.overlay.hasAttached()) this.overlay.attach(new DomPortal(this.el));
  }

  private detach() {
    if (!this.overlay?.hasAttached()) return;
    this.leaving ??= leave(this.el, () => {
      this.leaving = undefined;
      this.overlay?.detach();
    });
  }
}

@Directive({
  selector: '[fzHoverCardTrigger]',
  host: {
    '(pointerenter)': 'onPointer($event, true)',
    '(pointerleave)': 'onPointer($event, false)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur($event)',
  },
})
export class FzHoverCardTrigger {
  readonly fzHoverCardTrigger = input.required<FzHoverCard>();
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    effect(() => (this.fzHoverCardTrigger().anchor = this.el));
  }

  protected onPointer(event: PointerEvent, enter: boolean) {
    if (event.pointerType === 'touch') return;
    const card = this.fzHoverCardTrigger();
    card.schedule(enter, enter ? card.openDelay() : card.closeDelay());
  }

  // Keyboard focus opens it at once; a mouse click's focus does not.
  protected onFocus() {
    if (this.el.matches(':focus-visible')) this.fzHoverCardTrigger().schedule(true, 0);
  }

  protected onBlur(event: FocusEvent) {
    const card = this.fzHoverCardTrigger();
    if (!card.inside(event.relatedTarget)) card.close();
  }
}

export const FZ_HOVER_CARD = [FzHoverCard, FzHoverCardTrigger] as const;
