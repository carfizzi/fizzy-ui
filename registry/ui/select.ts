import {
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';
const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  // panelClass: the popup grows from the trigger side when it flips above.
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4, panelClass: 'fz-above' },
];

const TRIGGER =
  'flex h-(--fz-h) w-full min-w-40 cursor-default select-none items-center justify-between gap-2 rounded-md border bg-background px-(--fz-field-px) ' +
  'text-(length:--fz-text) shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50';
const CSS = {
  list: 'flex max-h-72 w-full flex-col gap-0.5 overflow-y-auto rounded-md border bg-background p-1 text-sm text-foreground shadow-md outline-none animate-fz-popup origin-top in-[.fz-above]:origin-bottom data-closing:animate-fz-fade-out',
  option:
    'flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 outline-none ' +
    'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-disabled:opacity-50 ' +
    "aria-selected:font-medium aria-selected:after:content-['✓']",
};
const CHEVRON = `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>`;

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
 * Keeps a combobox popup on screen while it plays its exit animation: open the overlay on
 * `expanded() || leaving()`. The popup content must outlive `expanded`, hence preserveContent.
 */
function closingPopup(combobox: () => Combobox, popup: () => ElementRef<HTMLElement> | undefined) {
  const leaving = signal(false);
  let cancel: (() => void) | undefined;
  effect(() => {
    const open = combobox().expanded();
    untracked(() => {
      combobox().preserveContent.set(true);
      cancel?.();
      cancel = undefined;
      const el = popup()?.nativeElement;
      if (open || !el) return leaving.set(false);
      leaving.set(true);
      cancel = leave(el, () => leaving.set(false));
    });
  });
  return leaving;
}

/** One choice of a `fz-select` or `fz-multiselect`. Renders nothing itself; `label` defaults to the value. */
@Directive({ selector: 'fz-select-item' })
export class FzSelectItem<V = unknown> {
  readonly value = input.required<V>();
  readonly label = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly text = computed(() => this.label() ?? String(this.value()));
}

/**
 * Single-value select: `<fz-select [(value)]="v" placeholder="…" aria-label="…">` with
 * `<fz-select-item value="…" label="…" />` children. The host is the Aria combobox; focus stays on
 * it while the arrows move through the options (aria-activedescendant). The list cancels
 * mousedown so a click on an option never takes focus away from the select.
 */
@Component({
  selector: 'fz-select',
  imports: [CdkConnectedOverlay, ComboboxPopup, ComboboxWidget, Listbox, Option],
  hostDirectives: [{ directive: Combobox, inputs: ['disabled'] }],
  host: { class: TRIGGER, '[attr.data-size]': 'size() ?? null' },
  template: `
    <span class="truncate" [class.text-muted-foreground]="!selected()">{{ selected()?.text() ?? placeholder() }}</span>
    ${CHEVRON}

    <ng-template
      [cdkConnectedOverlay]="{ origin: host, usePopover: 'inline', matchWidth: true }"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayOpen]="combobox.expanded() || leaving()"
    >
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div
          ngListbox
          ngComboboxWidget
          #listbox="ngListbox"
          #popup
          tabindex="-1"
          focusMode="activedescendant"
          selectionMode="explicit"
          [value]="listValue()"
          (valueChange)="pick($event)"
          [activeDescendant]="listbox.activeDescendant()"
          (mousedown)="$event.preventDefault()"
          (click)="onClick($event)"
          (keydown.enter)="close()"
          (keydown.space)="close()"
          [class]="css.list"
        >
          @for (item of items(); track item) {
            <div
              ngOption
              [value]="item.value()"
              [label]="item.text()"
              [disabled]="item.disabled()"
              [class]="css.option"
            >
              {{ item.text() }}
            </div>
          }
        </div>
      </ng-template>
    </ng-template>
  `,
})
export class FzSelect<V = unknown> {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  readonly value = model<V>();
  readonly placeholder = input('Select…');

  protected readonly items = contentChildren(FzSelectItem<V>);
  protected readonly combobox = inject(Combobox);
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  protected readonly leaving = closingPopup(() => this.combobox, this.popup);
  protected readonly host = inject(ElementRef);
  protected readonly positions = POSITIONS;
  protected readonly css = CSS;
  protected readonly selected = computed(() => this.items().find((i) => i.value() === this.value()));
  protected readonly listValue = linkedSignal<V[]>(() => (this.value() === undefined ? [] : [this.value()!]));

  protected pick(values: V[]) {
    if (values.length) this.value.set(values[0]);
    // Explicit mode toggles: clicking the selected option empties the listbox. A select never
    // clears itself, so push the current value back.
    else this.listValue.set(this.value() === undefined ? [] : [this.value()!]);
  }

  // Like a native select: a click on a disabled option keeps the list open.
  protected onClick(event: MouseEvent) {
    if (!(event.target as Element).closest('[aria-disabled=true]')) this.close();
  }

  protected close() {
    this.combobox.expanded.set(false);
  }
}

/**
 * Multi-value select: `<fz-multiselect [(value)]="list" placeholder="…" aria-label="…">` with the same
 * `<fz-select-item>` children. Click, Enter or Space toggle an option and keep the list open;
 * Escape, Tab or a click outside close it.
 */
@Component({
  selector: 'fz-multiselect',
  imports: [CdkConnectedOverlay, ComboboxPopup, ComboboxWidget, Listbox, Option],
  hostDirectives: [{ directive: Combobox, inputs: ['disabled'] }],
  host: { class: TRIGGER, '[attr.data-size]': 'size() ?? null' },
  template: `
    <span class="truncate" [class.text-muted-foreground]="!summary()">{{ summary() || placeholder() }}</span>
    ${CHEVRON}

    <ng-template
      [cdkConnectedOverlay]="{ origin: host, usePopover: 'inline', matchWidth: true }"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayOpen]="combobox.expanded() || leaving()"
    >
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div
          ngListbox
          ngComboboxWidget
          #listbox="ngListbox"
          #popup
          multi
          tabindex="-1"
          focusMode="activedescendant"
          selectionMode="explicit"
          [(value)]="value"
          [activeDescendant]="listbox.activeDescendant()"
          (mousedown)="$event.preventDefault()"
          [class]="css.list"
        >
          @for (item of items(); track item) {
            <div ngOption [value]="item.value()" [label]="item.text()" [disabled]="item.disabled()" [class]="css.option">
              {{ item.text() }}
            </div>
          }
        </div>
      </ng-template>
    </ng-template>
  `,
})
export class FzMultiselect<V = unknown> {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  readonly value = model<V[]>([]);
  readonly placeholder = input('Select…');

  protected readonly items = contentChildren(FzSelectItem<V>);
  protected readonly combobox = inject(Combobox);
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  protected readonly leaving = closingPopup(() => this.combobox, this.popup);
  protected readonly host = inject(ElementRef);
  protected readonly positions = POSITIONS;
  protected readonly css = CSS;
  protected readonly summary = computed(() =>
    this.items()
      .filter((i) => this.value().includes(i.value()))
      .map((i) => i.text())
      .join(', '),
  );
}

export const FZ_SELECT = [FzSelect, FzSelectItem] as const;
export const FZ_MULTISELECT = [FzMultiselect, FzSelectItem] as const;
