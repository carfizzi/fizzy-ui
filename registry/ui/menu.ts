import { DestroyRef, Directive, ElementRef, Injector, effect, inject, untracked } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@angular/aria/menu';
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
      'data-[visible=false]:hidden',
  },
})
export class FzMenu {
  readonly menu = inject(Menu);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private overlay?: OverlayRef;

  constructor() {
    effect(() => {
      const parent = this.menu.parent();
      // A submenu is placed (still hidden by data-visible) as soon as its parent menu shows:
      // Aria focuses into it the moment it opens and closes the parent if focus lands outside it.
      const grandparent = parent instanceof MenuItem ? parent.parent : undefined;
      const open = grandparent instanceof Menu ? grandparent.visible() : this.menu.visible();
      untracked(() => (parent && open ? this.attach(parent.element) : this.overlay?.detach()));
    });
    inject(DestroyRef).onDestroy(() => this.overlay?.dispose());
  }

  private attach(anchor: HTMLElement) {
    if (this.overlay?.hasAttached()) return;
    this.overlay ??= createOverlayRef(this.injector, {
      usePopover: true,
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, anchor)
        .withPopoverLocation('inline')
        .withPositions(this.menu.parent() instanceof MenuItem ? SUBMENU : DROPDOWN),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    this.overlay.attach(new DomPortal(this.el));
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
export class FzMenuItem {}

@Directive({
  selector: '[fzMenuSeparator]',
  host: { role: 'separator', class: '-mx-1 my-1 block h-px bg-border' },
})
export class FzMenuSeparator {}

export const FZ_MENU = [FzMenu, FzMenuTrigger, FzMenuItem, FzMenuSeparator] as const;
