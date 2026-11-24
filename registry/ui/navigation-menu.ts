import { Directive, ElementRef, contentChild, effect, inject, signal, untracked } from '@angular/core';

let nextId = 0;

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
 * Site navigation with dropdown panels of links (the APG disclosure navigation pattern, not a menu):
 * `<nav fzNavigationMenu aria-label="Main"><ul>` with `<li><a fzNavigationMenuLink>` and
 * `<li fzNavigationMenuItem><button fzNavigationMenuTrigger>` + `<div fzNavigationMenuContent>` of links.
 * One panel at a time; it opens on click (Enter, Space) or on hover, and closes on Escape (focus back
 * to its button), a click outside, or focus leaving the nav. Links stay links; Tab moves through them.
 */
@Directive({
  selector: 'nav[fzNavigationMenu]',
  host: {
    '(keydown.escape)': 'escape()',
    '(focusout)': 'onFocusOut($event)',
    '(document:pointerdown)': 'onOutside($event)',
    class: '[&>ul]:flex [&>ul]:items-center [&>ul]:gap-1 text-sm',
  },
})
export class FzNavigationMenu {
  readonly active = signal<FzNavigationMenuItem | null>(null);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  protected escape() {
    const item = this.active();
    if (!item) return;
    this.active.set(null);
    item.trigger()?.el.focus();
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.el.contains(event.relatedTarget as Node | null)) this.active.set(null);
  }

  protected onOutside(event: PointerEvent) {
    if (!this.el.contains(event.target as Node)) this.active.set(null);
  }
}

/** A top-level `li` holding a trigger and its panel. Hover opens it after a short delay. */
@Directive({
  selector: '[fzNavigationMenuItem]',
  host: {
    class: 'relative',
    '(pointerenter)': 'hover($event, true)',
    '(pointerleave)': 'hover($event, false)',
  },
})
export class FzNavigationMenuItem {
  readonly menu = inject(FzNavigationMenu);
  readonly trigger = contentChild(FzNavigationMenuTrigger);
  readonly contentId = `fz-navigation-menu-${nextId++}`;
  readonly open = () => this.menu.active() === this;
  private timer?: ReturnType<typeof setTimeout>;
  private hoverOpenedAt = 0;

  toggle() {
    clearTimeout(this.timer);
    // a click that follows a hover opening means "open", not "close what just opened"
    if (this.open() && Date.now() - this.hoverOpenedAt < 600) return;
    this.menu.active.set(this.open() ? null : this);
  }

  // Moving between items swaps panels at once; entering the bar waits a little, leaving waits a bit more.
  protected hover(event: PointerEvent, enter: boolean) {
    if (event.pointerType === 'touch') return;
    clearTimeout(this.timer);
    if (enter)
      this.timer = setTimeout(() => {
        if (!this.open()) this.hoverOpenedAt = Date.now();
        this.menu.active.set(this);
      }, this.menu.active() ? 0 : 150);
    else this.timer = setTimeout(() => this.open() && this.menu.active.set(null), 300);
  }
}

const ITEM =
  'inline-flex h-(--fz-h) items-center gap-1 rounded-md px-(--fz-field-px) font-medium outline-none transition-colors ' +
  'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
  'aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground';

@Directive({
  selector: 'button[fzNavigationMenuTrigger]',
  host: {
    type: 'button',
    '[attr.aria-expanded]': 'item.open()',
    '[attr.aria-controls]': 'item.contentId',
    '(click)': 'item.toggle()',
    class: `${ITEM} cursor-pointer aria-expanded:bg-accent aria-expanded:text-accent-foreground`,
  },
})
export class FzNavigationMenuTrigger {
  protected readonly item = inject(FzNavigationMenuItem);
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
}

/** A top-level link (no panel). Mark the current page with `aria-current="page"`. */
@Directive({ selector: 'a[fzNavigationMenuLink]', host: { class: ITEM } })
export class FzNavigationMenuLink {}

/** The panel of links. Opens below its trigger with the popup spring; fades out when it closes. */
@Directive({
  selector: '[fzNavigationMenuContent]',
  host: {
    '[id]': 'item.contentId',
    '[attr.data-open]': 'item.open()',
    class:
      'absolute top-full left-0 z-50 mt-2 w-max max-w-[calc(100vw-2rem)] origin-top-left rounded-md border bg-background p-2 text-foreground shadow-md ' +
      'animate-fz-popup data-[open=false]:not-data-closing:hidden data-closing:animate-fz-fade-out ' +
      '[&_a]:block [&_a]:rounded-sm [&_a]:px-3 [&_a]:py-2 [&_a]:outline-none [&_a:hover]:bg-accent [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring',
  },
})
export class FzNavigationMenuContent {
  protected readonly item = inject(FzNavigationMenuItem);

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    let cancel: (() => void) | undefined;
    let shown = false;
    effect(() => {
      const open = this.item.open();
      untracked(() => {
        cancel?.();
        cancel = undefined;
        if (!open && shown) cancel = leave(el, () => {});
        shown = open;
      });
    });
  }
}

export const FZ_NAVIGATION_MENU = [FzNavigationMenu, FzNavigationMenuItem, FzNavigationMenuTrigger, FzNavigationMenuLink, FzNavigationMenuContent] as const;
