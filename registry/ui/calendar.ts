import {
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';

// Dates are local days at midnight.
const day = (y: number, m: number, d: number) => new Date(y, m, d);
const addDays = (d: Date, n: number) => day(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const last = day(d.getFullYear(), d.getMonth() + n + 1, 0).getDate(); // Jan 31 + 1 month = Feb 28, not Mar 3
  return day(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => {
  const now = new Date();
  return day(now.getFullYear(), now.getMonth(), now.getDate());
};

/** The locale's first day of the week (0 = Sunday), where the browser knows it; else Monday. */
function firstDayOf(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const info = l.getWeekInfo?.() ?? l.weekInfo;
    if (info) return info.firstDay % 7;
  } catch {} // unknown locale: fall through
  return 1;
}

let nextId = 0;

/**
 * A month grid to pick a day: `<fz-calendar [(value)]="date" [min]="…" [max]="…" />`.
 * The APG date grid: one Tab stop on the focused day; arrows move by day and week, Home/End to the
 * week's start and end, PageUp/PageDown by month (Shift: by year), Enter or Space picks. Days are named
 * in full ("Saturday, 15 March 2026"), today is `aria-current="date"`, and the month heading is announced
 * when it changes. Names and the first day of the week follow the app's `LOCALE_ID`.
 * Not on Aria's grid: its cells are fixed, while arrows here cross into the next month.
 */
@Component({
  selector: 'fz-calendar',
  host: { class: 'inline-flex w-fit flex-col gap-2 text-sm' },
  template: `
    <div class="flex items-center justify-between gap-2">
      <button type="button" [class]="nav" [attr.aria-label]="'Previous month'" [attr.aria-disabled]="!canGo(-1) || null" (click)="go(-1)">
        <svg viewBox="0 0 16 16" class="size-4 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M10 4L6 8l4 4" /></svg>
      </button>
      <h2 [id]="labelId" aria-live="polite" class="font-medium">{{ monthLabel() }}</h2>
      <button type="button" [class]="nav" [attr.aria-label]="'Next month'" [attr.aria-disabled]="!canGo(1) || null" (click)="go(1)">
        <svg viewBox="0 0 16 16" class="size-4 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 4l4 4-4 4" /></svg>
      </button>
    </div>
    <table #grid role="grid" [attr.aria-labelledby]="labelId" class="border-collapse" (keydown)="onKeydown($event)">
      <thead>
        <tr>
          @for (w of weekdays(); track w.long) {
            <th scope="col" [attr.abbr]="w.long" class="size-9 p-0 text-xs font-normal text-muted-foreground">{{ w.short }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (week of weeks(); track $index) {
          <tr>
            @for (d of week; track $index) {
              @if (d) {
                <td
                  [attr.data-date]="key(d)"
                  [attr.tabindex]="isFocused(d) ? 0 : -1"
                  [attr.aria-selected]="isSelected(d)"
                  [attr.aria-current]="isToday(d) ? 'date' : null"
                  [attr.aria-disabled]="isOff(d) || null"
                  [attr.aria-label]="fullName(d)"
                  class="group size-9 cursor-pointer p-0 text-center outline-none aria-disabled:cursor-not-allowed"
                  (click)="pick(d)"
                >
                  <span
                    class="mx-auto flex size-8 items-center justify-center rounded-md transition-colors group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-ring group-aria-[current=date]:font-semibold group-aria-[current=date]:text-primary group-aria-selected:bg-primary! group-aria-selected:text-primary-foreground! group-aria-disabled:text-muted-foreground group-aria-disabled:line-through group-aria-disabled:opacity-50 group-aria-disabled:group-hover:bg-transparent"
                    >{{ d.getDate() }}</span
                  >
                </td>
              } @else {
                <td class="size-9 p-0"></td>
              }
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class FzCalendar {
  readonly value = model<Date | undefined>();
  readonly min = input<Date>();
  readonly max = input<Date>();
  /** Days that cannot be picked (weekends, holidays…). They stay reachable with the arrows. */
  readonly disabled = input<(d: Date) => boolean>(() => false);
  /** 0 = Sunday … 6 = Saturday. Default: from the locale. */
  readonly firstDayOfWeek = input<number>();
  readonly labelId = `fz-calendar-${nextId++}`;
  private readonly locale = inject(LOCALE_ID);
  private readonly injector = inject(Injector);
  private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
  /** The day with the Tab stop; the shown month follows it. */
  readonly focused = linkedSignal(() => this.clamp(this.value() ?? today()));
  protected readonly nav =
    'inline-flex size-8 cursor-pointer items-center justify-center rounded-md outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-disabled:pointer-events-none aria-disabled:opacity-50';

  private readonly start = computed(() => this.firstDayOfWeek() ?? firstDayOf(this.locale));
  protected readonly monthLabel = computed(() => new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(this.focused()));
  protected readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale, { weekday: 'long' });
    // 2024-01-07 is a Sunday
    return Array.from({ length: 7 }, (_, i) => day(2024, 0, 7 + ((this.start() + i) % 7))).map((d) => ({ short: short.format(d), long: long.format(d) }));
  });
  /** The shown month as weeks of 7; null pads the days of other months. */
  protected readonly weeks = computed(() => {
    const f = this.focused();
    const first = day(f.getFullYear(), f.getMonth(), 1);
    const days = day(f.getFullYear(), f.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array((first.getDay() - this.start() + 7) % 7).fill(null);
    for (let i = 1; i <= days; i++) cells.push(day(f.getFullYear(), f.getMonth(), i));
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  });
  private readonly fullFormat = computed(() => new Intl.DateTimeFormat(this.locale, { dateStyle: 'full' }));

  protected key = iso;
  protected fullName = (d: Date) => this.fullFormat().format(d);
  protected isFocused = (d: Date) => same(d, this.focused());
  protected isSelected = (d: Date) => same(d, this.value());
  protected isToday = (d: Date) => same(d, today());
  protected isOff = (d: Date) => this.outside(d) || this.disabled()(d);

  /** Moves focus to the day with the Tab stop (after a render). */
  focus() {
    afterNextRender(() => this.grid().nativeElement.querySelector<HTMLElement>('td[tabindex="0"]')?.focus(), { injector: this.injector });
  }

  protected canGo(months: number) {
    const target = addMonths(this.focused(), months);
    const edge = months < 0 ? day(target.getFullYear(), target.getMonth() + 1, 0) : day(target.getFullYear(), target.getMonth(), 1);
    return !this.outside(edge);
  }

  protected go(months: number) {
    if (this.canGo(months)) this.focused.set(this.clamp(addMonths(this.focused(), months)));
  }

  protected pick(d: Date) {
    this.focused.set(d);
    if (!this.isOff(d)) this.value.set(d);
  }

  protected onKeydown(event: KeyboardEvent) {
    const f = this.focused();
    const weekday = (f.getDay() - this.start() + 7) % 7;
    const rtl = getComputedStyle(this.grid().nativeElement).direction === 'rtl' ? -1 : 1;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(f, -rtl),
      ArrowRight: () => addDays(f, rtl),
      ArrowUp: () => addDays(f, -7),
      ArrowDown: () => addDays(f, 7),
      Home: () => addDays(f, -weekday),
      End: () => addDays(f, 6 - weekday),
      PageUp: () => addMonths(f, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(f, event.shiftKey ? 12 : 1),
    };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.pick(f);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    this.focused.set(this.clamp(move()));
    this.focus();
  }

  private outside(d: Date) {
    const min = this.min(), max = this.max();
    return (!!min && d < day(min.getFullYear(), min.getMonth(), min.getDate())) || (!!max && d > day(max.getFullYear(), max.getMonth(), max.getDate()));
  }

  private clamp(d: Date) {
    const min = this.min(), max = this.max();
    if (min && d < min) return day(min.getFullYear(), min.getMonth(), min.getDate());
    if (max && d > max) return day(max.getFullYear(), max.getMonth(), max.getDate());
    return d;
  }
}

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4, panelClass: 'fz-above' },
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
 * A button that opens a calendar: `<fz-date-picker [(value)]="date" placeholder="Pick a date" />`,
 * labelled by `fzField` (its name reads "label, date"). Opening focuses the picked day (or today);
 * picking closes it and gives focus back to the button; Escape and a click outside close it.
 * `min`, `max` and `disabled` go to the calendar.
 * shortcut: no typing a date in; use a native `<input type="date">` where typing matters most.
 */
@Component({
  selector: 'fz-date-picker',
  imports: [CdkConnectedOverlay, FzCalendar],
  host: { class: 'inline-flex w-full min-w-40', '[attr.data-size]': 'size() ?? null' },
  template: `
    <button
      #trigger
      type="button"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? popupId : null"
      class="flex h-(--fz-h) w-full cursor-pointer items-center gap-2 rounded-md border bg-background px-(--fz-field-px) text-left text-(length:--fz-text) shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      (click)="toggle()"
    >
      <svg viewBox="0 0 16 16" class="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" /><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" /></svg>
      <span class="truncate" [class.text-muted-foreground]="!value()">{{ text() }}</span>
    </button>
    <ng-template
      [cdkConnectedOverlay]="{ origin: trigger, usePopover: 'inline' }"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayOpen]="open() || leaving()"
      (overlayOutsideClick)="onOutside($event)"
    >
      <div
        #popup
        [id]="popupId"
        role="dialog"
        aria-label="Choose date"
        class="rounded-md border bg-background p-3 text-foreground shadow-md animate-fz-popup origin-top-left in-[.fz-above]:origin-bottom-left data-closing:animate-fz-fade-out"
        (keydown.escape)="close(true)"
        (focusout)="onFocusOut($event)"
      >
        <fz-calendar [value]="value()" (valueChange)="pick($event)" [min]="min()" [max]="max()" [disabled]="disabled()" />
      </div>
    </ng-template>
  `,
})
export class FzDatePicker {
  readonly value = model<Date | undefined>();
  readonly placeholder = input('Pick a date');
  readonly min = input<Date>();
  readonly max = input<Date>();
  readonly disabled = input<(d: Date) => boolean>(() => false);
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  readonly open = signal(false);
  protected readonly popupId = `fz-date-picker-${nextId++}`;
  protected readonly positions = POSITIONS;
  protected readonly leaving = signal(false);
  private readonly locale = inject(LOCALE_ID);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  private readonly calendar = viewChild(FzCalendar);
  protected readonly text = computed(() => {
    const v = this.value();
    return v ? new Intl.DateTimeFormat(this.locale, { dateStyle: 'medium' }).format(v) : this.placeholder();
  });

  constructor() {
    let cancel: (() => void) | undefined;
    effect(() => {
      const open = this.open();
      untracked(() => {
        cancel?.();
        cancel = undefined;
        const el = this.popup()?.nativeElement;
        if (open) {
          this.leaving.set(false);
          this.calendar()?.focus();
        } else if (el) {
          this.leaving.set(true);
          cancel = leave(el, () => this.leaving.set(false));
        }
      });
    });
    // The calendar exists once the overlay renders: focus its day then.
    effect(() => {
      const calendar = this.calendar();
      if (calendar && untracked(this.open)) untracked(() => calendar.focus());
    });
  }

  protected toggle() {
    if (this.open()) this.close(false);
    else this.open.set(true);
  }

  close(refocus: boolean) {
    if (!this.open()) return;
    this.open.set(false);
    if (refocus) this.trigger().nativeElement.focus();
  }

  protected pick(d: Date | undefined) {
    this.value.set(d);
    this.close(true);
  }

  protected onOutside(event: MouseEvent) {
    if (!this.trigger().nativeElement.contains(event.target as Node)) this.close(false);
  }

  protected onFocusOut(event: FocusEvent) {
    const to = event.relatedTarget as Node | null;
    if (to && !this.popup()?.nativeElement.contains(to) && to !== this.trigger().nativeElement) this.close(false);
  }
}

export const FZ_CALENDAR = [FzCalendar] as const;
export const FZ_DATE_PICKER = [FzDatePicker, FzCalendar] as const;
