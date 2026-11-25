import { Component, ElementRef, Injectable, Injector, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentPortal } from '@angular/cdk/portal';
import { OverlayRef, createGlobalPositionStrategy, createOverlayRef } from '@angular/cdk/overlay';

export interface FzToastOptions {
  description?: string;
  /** `destructive` is styled as an error and announced assertively. */
  variant?: 'default' | 'destructive';
  /** A button in the toast, e.g. "Undo". The toast closes after it runs. */
  action?: { label: string; run: () => void };
  /** Milliseconds before it closes by itself; `Infinity` keeps it until dismissed. */
  duration?: number;
}

export interface FzToast extends Required<Omit<FzToastOptions, 'description' | 'action'>>, Pick<FzToastOptions, 'description' | 'action'> {
  id: number;
  title: string;
}

// shortcut: older toasts are dropped beyond this, no collapsed stack; add one if many toasts at once is common.
const MAX_VISIBLE = 3;

/**
 * Notifications: `inject(FzToaster).show('Saved', { description, action: { label: 'Undo', run } })`.
 * No markup needed: the first toast creates a "Notifications" region in an overlay (bottom right,
 * full width on phones). Screen readers hear each toast through the CDK `LiveAnnouncer`.
 * Timers pause while the pointer or focus is on the toasts; Alt+T moves focus to them.
 */
@Injectable({ providedIn: 'root' })
export class FzToaster {
  readonly toasts = signal<FzToast[]>([]);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly timers = new Map<number, { left: number; started: number; handle?: ReturnType<typeof setTimeout> }>();
  private overlay?: OverlayRef;
  private paused = false;
  private nextId = 0;

  show(title: string, options: FzToastOptions = {}): number {
    this.overlay ??= this.createOverlay();
    const toast: FzToast = { id: ++this.nextId, title, variant: 'default', duration: 5000, ...options };
    const list = this.toasts();
    const dropped = list.slice(0, Math.max(list.length - (MAX_VISIBLE - 1), 0));
    dropped.forEach((t) => this.stop(t.id));
    this.toasts.update((list) => [...list.slice(dropped.length), toast]);
    if (Number.isFinite(toast.duration)) {
      this.timers.set(toast.id, { left: toast.duration, started: 0 });
      if (!this.paused) this.start(toast.id);
    }
    const text = options.description ? `${title}. ${options.description}` : title;
    void this.announcer.announce(text, toast.variant === 'destructive' ? 'assertive' : 'polite');
    return toast.id;
  }

  dismiss(id: number) {
    this.stop(id);
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Called by the region: hover or focus on the toasts holds every timer. */
  pause(paused: boolean) {
    if (paused === this.paused) return;
    this.paused = paused;
    for (const [id, timer] of this.timers) {
      if (!paused) {
        this.start(id);
        continue;
      }
      clearTimeout(timer.handle);
      timer.left -= Date.now() - timer.started;
    }
  }

  private start(id: number) {
    const timer = this.timers.get(id)!;
    timer.started = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), Math.max(timer.left, 0));
  }

  private stop(id: number) {
    clearTimeout(this.timers.get(id)?.handle);
    this.timers.delete(id);
  }

  private createOverlay() {
    const overlay = createOverlayRef(this.injector, {
      usePopover: true,
      width: '100%',
      maxWidth: '26rem',
      positionStrategy: createGlobalPositionStrategy(this.injector).bottom('0').end('0'),
      // the empty part of the region must not catch clicks (CDK's pane style is unlayered: !)
      panelClass: 'pointer-events-none!',
    });
    overlay.attach(new ComponentPortal(FzToastRegion, null, this.injector));
    return overlay;
  }
}

@Component({
  selector: 'fz-toast-region',
  host: {
    role: 'region',
    'aria-label': 'Notifications (Alt+T)',
    tabindex: '-1',
    class: 'flex flex-col gap-2 p-4 outline-none',
    '(pointerenter)': 'toaster.pause(true)',
    '(pointerleave)': 'toaster.pause(el.contains(doc.activeElement))',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
    '(document:keydown)': 'onHotkey($event)',
  },
  template: `
    @for (t of toaster.toasts(); track t.id) {
      <!-- animate.leave: Angular keeps the toast until its exit animation ends; ! beats animate-fz-toast -->
      <div
        class="group pointer-events-auto relative flex items-center gap-3 rounded-lg border bg-background p-4 pe-10 text-sm text-foreground shadow-lg animate-fz-toast data-[variant=destructive]:border-destructive"
        animate.leave="animate-fz-fade-out!"
        data-toast
        [attr.data-variant]="t.variant"
        (keydown.escape)="close(t.id)"
      >
        <div class="grid flex-1 gap-1">
          <p class="font-medium group-data-[variant=destructive]:text-destructive">{{ t.title }}</p>
          @if (t.description) {
            <p class="text-muted-foreground">{{ t.description }}</p>
          }
        </div>
        @if (t.action; as action) {
          <button
            type="button"
            class="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-md border bg-background px-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            (click)="action.run(); close(t.id)"
          >
            {{ action.label }}
          </button>
        }
        <button
          type="button"
          aria-label="Dismiss"
          class="absolute top-2 end-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          (click)="close(t.id)"
        >
          <svg viewBox="0 0 16 16" class="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    }
  `,
})
export class FzToastRegion {
  protected readonly toaster = inject(FzToaster);
  protected readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly doc = this.el.ownerDocument;
  /** Where focus was before it came into the toasts: it goes back there when a focused toast closes. */
  private returnFocus?: HTMLElement;

  protected onFocusIn(event: FocusEvent) {
    if (!this.el.contains(event.relatedTarget as Node | null)) this.returnFocus = event.relatedTarget as HTMLElement | undefined;
    this.toaster.pause(true);
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.el.contains(event.relatedTarget as Node | null)) this.toaster.pause(this.el.matches(':hover'));
  }

  protected onHotkey(event: KeyboardEvent) {
    if (!event.altKey || event.code !== 'KeyT' || !this.toaster.toasts().length) return;
    event.preventDefault();
    this.el.focus();
  }

  protected close(id: number) {
    const hadFocus = this.el.contains(this.doc.activeElement);
    this.toaster.dismiss(id);
    if (hadFocus) {
      this.returnFocus?.focus();
      this.toaster.pause(this.el.matches(':hover'));
    }
  }
}

/** Nothing to import: inject `FzToaster`. Kept for the `FZ_<NAME>` convention. */
export const FZ_TOAST = [] as const;
