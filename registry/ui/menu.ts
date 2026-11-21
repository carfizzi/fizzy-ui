import { Component, DestroyRef, Directive, ElementRef, Injector, afterNextRender, computed, effect, inject, input, untracked, viewChild } from '@angular/core';
import { Menu, MenuBar, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { DomPortal } from '@angular/cdk/portal';
import {
  ConnectedPosition,
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';

const DROPDOWN: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];
const SUBMENU: ConnectedPosition[] = [
  { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 4, offsetY: -5 },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -4, offsetY: -5 },
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
 * The menu panel. Aria decides when it is visible; this directive moves its own element into a
 * CDK overlay anchored to the trigger (or to the parent item for a submenu) while it is open.
 * Pass `ref.menu` to `[fzMenuTrigger]` / `[submenu]`, with `#ref="fzMenu"`.
 */
@Directive({
  selector: '[fzMenu]',
  exportAs: 'fzMenu',
  hostDirectives: [
    { directive: Menu, inputs: ['wrap', 'typeaheadDelay', 'disabled', 'softDisabled', 'expansionDelay'], outputs: ['itemSelected'] },
  ],
  host: {
    class:
      'flex min-w-40 flex-col rounded-md border bg-background p-1 text-sm text-foreground shadow-md outline-none ' +
      'data-[visible=false]:not-data-closing:hidden animate-fz-popup data-closing:animate-fz-fade-out data-submenu:animate-none',
    // Submenus (and menubar menus, which switch as you move along the bar) open instantly: frequent.
    '[attr.data-submenu]': 'submenu() || null',
  },
})
export class FzMenu {
  readonly menu = inject(Menu);
  protected readonly submenu = computed(() => this.menu.parent() instanceof MenuItem);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private overlay?: OverlayRef;
  private leaving?: () => void;

  constructor() {
    effect(() => {
      const parent = this.menu.parent();
      // A submenu is placed (still hidden by data-visible) as soon as its parent menu shows, and a
      // menubar submenu right away: Aria focuses into it the moment it opens and closes the
      // parent if focus lands outside it.
      const grandparent = parent instanceof MenuItem ? parent.parent : undefined;
      const open = grandparent instanceof Menu ? grandparent.visible() : !!grandparent || this.menu.visible();
      untracked(() => {
        if (parent && open) {
          const reopened = !!this.leaving;
          this.leaving?.();
          this.leaving = undefined;
          this.attach(parent.element);
          if (reopened) this.overlay?.updatePosition(); // a context menu's anchor may have moved
        } else if (this.overlay?.hasAttached() && !this.submenu()) {
          this.leaving ??= leave(this.el.nativeElement, () => {
            this.leaving = undefined;
            this.overlay?.detach();
          });
        } else {
          this.overlay?.detach();
        }
      });
    });
    inject(DestroyRef).onDestroy(() => this.overlay?.dispose());
  }

  /** Re-reads the anchor's position, e.g. after a context menu moved it. */
  reposition() {
    this.overlay?.updatePosition();
  }

  private attach(anchor: HTMLElement) {
    if (this.overlay?.hasAttached()) return;
    this.overlay ??= createOverlayRef(this.injector, {
      usePopover: true,
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, anchor)
        .withPopoverLocation('inline')
        .withTransformOriginOn(':scope > .cdk-overlay-pane > *')
        .withPositions(this.isNested() ? SUBMENU : DROPDOWN),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlay.attach(new DomPortal(this.el));
  }

  private isNested() {
    const parent = this.menu.parent();
    return parent instanceof MenuItem && parent.parent instanceof Menu;
  }
}

/** Opens `[fzMenuTrigger]="ref.menu"`. Put it on a `fzButton`. */
@Directive({
  selector: '[fzMenuTrigger]',
  hostDirectives: [{ directive: MenuTrigger, inputs: ['menu: fzMenuTrigger', 'disabled', 'softDisabled'] }],
})
export class FzMenuTrigger {}

@Directive({
  selector: '[fzMenuItem]',
  hostDirectives: [{ directive: MenuItem, inputs: ['value', 'disabled', 'searchTerm', 'submenu'] }],
  host: {
    class:
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 outline-none ' +
      'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-expanded:bg-accent ' +
      'aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
      "aria-[haspopup=true]:after:ml-auto aria-[haspopup=true]:after:content-['›']",
  },
})
export class FzMenuItem {
  constructor() {
    // Aria's typeahead matches searchTerm, which defaults to '': fall back to the item's text.
    const item = inject(MenuItem);
    const el: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => item.searchTerm() || item.searchTerm.set(el.textContent!.trim()));
  }
}

@Directive({
  selector: '[fzMenuSeparator]',
  host: { role: 'separator', class: '-mx-1 my-1 block h-px bg-border' },
})
export class FzMenuSeparator {}

/** Horizontal bar of `fzMenuItem`s, each with a `[submenu]`. */
@Directive({
  selector: '[fzMenubar]',
  hostDirectives: [{ directive: MenuBar, inputs: ['disabled', 'softDisabled', 'wrap', 'typeaheadDelay'], outputs: ['itemSelected'] }],
  host: {
    class:
      'flex h-9 w-fit items-center gap-1 rounded-md border bg-background p-1 text-sm ' +
      // top-level items open downwards: no submenu chevron (more specific than the item's own rule)
      '[&>[role=menuitem][aria-haspopup=true]]:after:content-none ' +
      // Aria keeps one item "active" for roving focus: only show it while focus is in the bar
      '[&:not(:focus-within)>[role=menuitem]]:bg-transparent',
  },
})
export class FzMenubar {}

/**
 * Right-click area: `<div [fzContextMenu]="ref">…</div>` with `<div fzMenu #ref="fzMenu">`.
 * Opens at the pointer (or where the keyboard's context-menu key fires) and gives focus back on close.
 */
@Component({
  selector: '[fzContextMenu]',
  imports: [MenuTrigger],
  host: { '(contextmenu)': 'open($event)' },
  template: `
    <ng-content />
    <!-- Invisible anchor moved to the pointer: the menu is positioned against it. -->
    <span #anchor ngMenuTrigger [menu]="fzContextMenu().menu" style="position: fixed; visibility: hidden"></span>
  `,
})
export class FzContextMenu {
  readonly fzContextMenu = input.required<FzMenu>();
  private readonly anchor = viewChild.required('anchor', { read: ElementRef<HTMLElement> });
  private readonly trigger = viewChild.required(MenuTrigger);
  private previousFocus: HTMLElement | null = null;

  constructor() {
    let wasOpen = false;
    effect(() => {
      const open = this.trigger().expanded();
      if (wasOpen && !open) untracked(() => this.restoreFocus());
      wasOpen = open;
    });
  }

  protected open(event: MouseEvent) {
    event.preventDefault();
    this.previousFocus = document.activeElement as HTMLElement | null;
    const { style } = this.anchor().nativeElement;
    // DROPDOWN puts the menu 4px below its anchor; lift the anchor so the menu starts at the pointer.
    style.left = `${event.clientX}px`;
    style.top = `${event.clientY - 4}px`;
    if (this.trigger().expanded()) this.fzContextMenu().reposition();
    else this.trigger().open();
  }

  // Aria refocuses the (invisible) anchor on close, which fails: put focus back where it was,
  // unless the user already moved it somewhere else.
  private restoreFocus() {
    const active = document.activeElement;
    const lost = !active || active === document.body || active === this.anchor().nativeElement || this.fzContextMenu().menu.element.contains(active);
    if (lost) this.previousFocus?.focus();
  }
}

export const FZ_MENU = [FzMenu, FzMenuTrigger, FzMenuItem, FzMenuSeparator] as const;
export const FZ_MENUBAR = [FzMenubar, FzMenu, FzMenuItem, FzMenuSeparator] as const;
export const FZ_CONTEXT_MENU = [FzContextMenu, FzMenu, FzMenuItem, FzMenuSeparator] as const;
