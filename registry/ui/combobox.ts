import { Component, Directive, ElementRef, ViewContainerRef, computed, inject, input, linkedSignal } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

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
    '(click)': 'combobox.expanded.set(true)',
    class:
      'flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-xs outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
})
export class FzCombobox {
  readonly options = input.required<readonly string[]>();
  readonly combobox = inject(Combobox);
  readonly element = inject(ElementRef<HTMLInputElement>).nativeElement;
  readonly filtered = computed(() => {
    const query = this.combobox.value().trim().toLowerCase();
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
      [cdkConnectedOverlayOpen]="open()"
    >
      <ng-template ngComboboxPopup [combobox]="owner().combobox">
        <div class="w-full rounded-md border bg-background p-1 text-sm text-foreground shadow-md" (mousedown)="$event.preventDefault()">
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
