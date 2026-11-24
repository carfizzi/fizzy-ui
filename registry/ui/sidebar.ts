import { Component, DestroyRef, Directive, ElementRef, Injector, afterNextRender, computed, effect, inject, input, model, signal, untracked } from '@angular/core';

const MOBILE = '(max-width: 47.99rem)'; // below Tailwind's md
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let nextId = 0;

/**
 * An app layout with a side navigation: `<div fzSidebarLayout [(open)]="open">` holding a `<fz-sidebar>`
 * and your main content with a `<button fzSidebarTrigger>`. On wide screens the sidebar is a column that
 * the trigger collapses and expands (`open`). Below `md` it is a drawer: while it is open, everything
 * else on the page is inert (a modal without a focus trap to get wrong), focus moves into it, and Escape,
 * the backdrop or following a link closes it, with focus back on the trigger.
 */
@Directive({
  selector: '[fzSidebarLayout]',
  exportAs: 'fzSidebarLayout',
  host: { class: 'relative flex min-h-0 w-full', '(keydown.escape)': 'closeDrawer()' },
})
export class FzSidebarLayout {
  /** Wide screens: whether the column is shown. */
  readonly open = model(true);
  /** Phones: whether the drawer is open. */
  readonly drawerOpen = signal(false);
  readonly mobile = signal(false);
  readonly expanded = computed(() => (this.mobile() ? this.drawerOpen() : this.open()));
  readonly sidebarId = `fz-sidebar-${nextId++}`;
  sidebar?: HTMLElement;
  private trigger?: HTMLElement;
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly backdrop: HTMLElement;
  private inerted: HTMLElement[] = [];

  constructor() {
    if (typeof matchMedia === 'function') {
      const query = matchMedia(MOBILE);
      const update = () => this.mobile.set(query.matches);
      update();
      query.addEventListener('change', update);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update));
    }
    // The drawer's backdrop: a sibling of the sidebar, so the sidebar's transform doesn't confine it.
    this.backdrop = this.el.ownerDocument.createElement('div');
    this.backdrop.className =
      'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fz-tooltip md:hidden data-[open=false]:hidden';
    this.backdrop.addEventListener('click', () => this.closeDrawer());
    this.el.append(this.backdrop);

    effect(() => {
      const modal = this.mobile() && this.drawerOpen();
      untracked(() => this.modal(modal));
    });
    // Growing to a wide screen with the drawer open: it is a column now, nothing to keep modal.
    effect(() => {
      if (!this.mobile()) untracked(() => this.drawerOpen.set(false));
    });
  }

  toggle(trigger?: HTMLElement) {
    this.trigger = trigger ?? this.trigger;
    if (this.mobile()) this.drawerOpen.update((o) => !o);
    else this.open.update((o) => !o);
  }

  closeDrawer() {
    if (this.mobile() && this.drawerOpen()) this.drawerOpen.set(false);
  }

  private modal(on: boolean) {
    this.backdrop.dataset['open'] = String(on);
    if (on) {
      // Inert every element beside the path from the drawer up to <body>.
      for (let node = this.sidebar; node && node !== this.el.ownerDocument.body; node = node.parentElement ?? undefined) {
        for (const sibling of node.parentElement?.children ?? []) {
          if (sibling === node || sibling === this.backdrop || !(sibling instanceof HTMLElement) || sibling.inert) continue;
          sibling.inert = true;
          this.inerted.push(sibling);
        }
      }
      afterNextRender(() => this.sidebar?.querySelector<HTMLElement>(FOCUSABLE)?.focus(), { injector: this.injector });
    } else if (this.inerted.length) {
      this.inerted.forEach((el) => (el.inert = false));
      this.inerted = [];
      this.trigger?.focus(); // back to what opened it
    }
  }
}

/** The sidebar itself. Put headers, `fzSidebarGroupLabel`s and lists of `fzSidebarItem`s in it. */
@Component({
  selector: 'fz-sidebar',
  host: {
    '[id]': 'layout.sidebarId',
    '[attr.data-state]': "layout.expanded() ? 'open' : 'closed'",
    '[inert]': '!layout.expanded()',
    '[attr.role]': "layout.mobile() ? 'dialog' : null",
    '[attr.aria-modal]': "layout.mobile() && layout.expanded() ? 'true' : null",
    // a name only as a dialog (phones); on a column it would sit on an element with no role
    '[attr.aria-label]': 'layout.mobile() ? ariaLabel() : null',
    '(click)': 'onClick($event)',
    class:
      'flex h-full shrink-0 flex-col overflow-hidden border-r bg-background ' +
      'motion-safe:transition-[width,translate,box-shadow] motion-safe:duration-(--fz-duration-popup) motion-safe:ease-spring ' +
      // wide screens: a column that collapses to nothing
      'md:w-64 md:data-[state=closed]:w-0 md:data-[state=closed]:border-r-0 ' +
      // phones: a drawer from the left
      'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-72 max-md:max-w-[85vw] max-md:shadow-lg max-md:data-[state=closed]:-translate-x-full max-md:data-[state=closed]:shadow-none',
  },
  // A fixed-width inside, so the content doesn't reflow while the column collapses.
  template: `<div class="flex h-full w-64 flex-col gap-4 overflow-y-auto p-3 max-md:w-full"><ng-content /></div>`,
})
export class FzSidebar {
  /** Names the drawer on phones. */
  readonly ariaLabel = input('Sidebar', { alias: 'aria-label' });
  protected readonly layout = inject(FzSidebarLayout);

  constructor() {
    this.layout.sidebar = inject(ElementRef).nativeElement;
  }

  // Following a link in the drawer closes it.
  protected onClick(event: Event) {
    if ((event.target as Element).closest('a[href]')) this.layout.closeDrawer();
  }
}

@Directive({
  selector: 'button[fzSidebarTrigger]',
  host: {
    type: 'button',
    '[attr.aria-expanded]': 'layout.expanded()',
    '[attr.aria-controls]': 'layout.sidebarId',
    '(click)': 'layout.toggle(el)',
  },
})
export class FzSidebarTrigger {
  protected readonly layout = inject(FzSidebarLayout);
  protected readonly el: HTMLElement = inject(ElementRef).nativeElement;
}

@Directive({
  selector: '[fzSidebarGroupLabel]',
  host: { class: 'px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase' },
})
export class FzSidebarGroupLabel {}

/** A link or button in the sidebar; the current page has `aria-current="page"`. */
@Directive({
  selector: 'a[fzSidebarItem], button[fzSidebarItem]',
  host: {
    class:
      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent/60 ' +
      'focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground',
  },
})
export class FzSidebarItem {}

export const FZ_SIDEBAR = [FzSidebarLayout, FzSidebar, FzSidebarTrigger, FzSidebarGroupLabel, FzSidebarItem] as const;
