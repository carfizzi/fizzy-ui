import { Component, Directive, ElementRef, ViewContainerRef, computed, effect, inject, input, linkedSignal, output, signal, untracked, viewChild } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

type FzSize = 'xs' | 'sm' | 'md' | 'lg';
const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  // panelClass: the popup grows from the trigger side when it flips above.
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

/**
 * Autocomplete on your own `<input>`: `<input fzCombobox [options]="list" [(value)]="text">`.
 * The input is the Aria combobox; typing filters `options` (case-insensitive "contains") and
 * picking one writes its text into the input. Label it like any input (`<label for>`).
 * shortcut: options are plain strings; add `{ value, label }` items when a caller needs ids.
 */
@Directive({
  selector: 'input[fzCombobox]',
  hostDirectives: [{ directive: Combobox, inputs: ['value', 'disabled'], outputs: ['valueChange'] }],
  host: {
    autocomplete: 'off',
    // Forms bind Aria's value (a model), not the native input's: typing and picking both reach them.
    ngNoCva: '',
    '(blur)': 'touch.emit()',
    '[attr.data-size]': 'size() ?? null',
    // our size, not the native one (a width in characters): keep the DOM attribute out
    '[attr.size]': 'null',
    '(click)': 'combobox.expanded.set(true)',
    class:
      'flex h-(--fz-h) w-full min-w-0 rounded-md border bg-background px-(--fz-field-px) py-1 text-(length:--fz-text) shadow-xs outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ' +
      'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
  },
})
export class FzCombobox {
  /** xs, sm, md, lg. Unset, it takes the size of the nearest `data-size` container, else md. */
  readonly size = input<FzSize>();
  readonly options = input.required<readonly string[]>();
  /** Emits on blur: forms mark the field touched. */
  readonly touch = output();
  readonly combobox = inject(Combobox);
  readonly element = inject(ElementRef<HTMLInputElement>).nativeElement;
  readonly filtered = computed(() => {
    const query = (this.combobox.value() ?? '').trim().toLowerCase(); // forms may write null
    return this.options().filter((o) => o.toLowerCase().includes(query));
  });

  constructor() {
    // The popup is a sibling component: an <input> can't host a template.
    inject(ViewContainerRef).createComponent(FzComboboxPanel).setInput('owner', this);
  }
}

@Component({
  selector: 'fz-combobox-panel',
  imports: [CdkConnectedOverlay, ComboboxPopup, ComboboxWidget, Listbox, Option],
  template: `
    <div aria-live="polite" class="sr-only">{{ open() && !owner().filtered().length ? 'No results' : '' }}</div>
    <ng-template
      [cdkConnectedOverlay]="{ origin: owner().element, usePopover: 'inline', matchWidth: true }"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayOpen]="open() || leaving()"
    >
      <ng-template ngComboboxPopup [combobox]="owner().combobox">
        <div class="w-full rounded-md border bg-background p-1 text-sm text-foreground shadow-md animate-fz-popup origin-top in-[.fz-above]:origin-bottom data-closing:animate-fz-fade-out" #popup (mousedown)="$event.preventDefault()">
          @if (owner().filtered().length) {
            <div
              ngListbox
              ngComboboxWidget
              #listbox="ngListbox"
              tabindex="-1"
              focusMode="activedescendant"
              [(value)]="selected"
              [activeDescendant]="listbox.activeDescendant()"
              (click)="commit()"
              (keydown.enter)="commit()"
              class="flex max-h-72 flex-col gap-0.5 overflow-y-auto outline-none"
            >
              @for (option of owner().filtered(); track option) {
                <div
                  ngOption
                  [value]="option"
                  [label]="option"
                  class="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                >
                  {{ option }}
                </div>
              }
            </div>
          } @else {
            <div class="px-2 py-4 text-center text-muted-foreground">No results</div>
          }
        </div>
      </ng-template>
    </ng-template>
  `,
})
export class FzComboboxPanel {
  readonly owner = input.required<FzCombobox>();
  protected readonly positions = POSITIONS;
  protected readonly open = computed(() => this.owner().combobox.expanded());
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  protected readonly leaving = closingPopup(() => this.owner().combobox, this.popup);
  protected readonly selected = linkedSignal<string[]>(() => {
    const text = this.owner().combobox.value();
    return this.owner().options().includes(text) ? [text] : [];
  });

  protected commit() {
    const [picked] = this.selected();
    if (picked !== undefined) this.owner().combobox.value.set(picked);
    this.owner().combobox.expanded.set(false);
  }
}

export const FZ_COMBOBOX = [FzCombobox] as const;
