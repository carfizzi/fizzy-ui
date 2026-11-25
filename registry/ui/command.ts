import { Component, DestroyRef, Directive, ElementRef, afterNextRender, afterRenderEffect, booleanAttribute, computed, contentChildren, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';

let nextId = 0;

/** A titled section of `fz-command`: `<fz-command-group heading="Pages">` around items. */
@Directive({ selector: 'fz-command-group' })
export class FzCommandGroup {
  readonly heading = input.required<string>();
  readonly id = `fz-command-group-${nextId++}`;
}

/** One command, read as data: `<fz-command-item value="settings" label="Settings" [keywords]="['prefs']" shortcut="⌘," />`. */
@Directive({ selector: 'fz-command-item' })
export class FzCommandItem<V = unknown> {
  readonly value = input.required<V>();
  readonly label = input<string>();
  /** Extra words that match this item when typed (not shown). */
  readonly keywords = input<readonly string[]>([]);
  readonly shortcut = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly text = computed(() => this.label() ?? String(this.value()));
  readonly group = inject(FzCommandGroup, { optional: true });
}

/**
 * A searchable list of commands (a ⌘K palette): `<fz-command (itemSelected)="run($event)">` with
 * `fz-command-group`s and `fz-command-item`s. Typing filters by label and keywords; the first match is
 * highlighted, so Enter runs it. The field is a combobox whose list is always shown; focus stays in it
 * (`aria-activedescendant`). Put it in an `fzDialog` for a palette.
 */
@Component({
  selector: 'fz-command',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
  host: { class: 'flex w-full flex-col overflow-hidden rounded-lg border bg-background text-sm text-foreground' },
  template: `
    <div class="flex items-center gap-2 border-b px-3">
      <svg viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        ngCombobox
        #combobox="ngCombobox"
        alwaysExpanded
        [(value)]="query"
        autocomplete="off"
        [attr.aria-label]="label()"
        [placeholder]="placeholder()"
        (keydown.escape)="forwardEscape()"
        class="h-11 w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
    <div aria-live="polite" class="sr-only">{{ count() ? '' : 'No results' }}</div>
    <!-- The results area moves to the content's height with a spring (instant under Reduce Motion) -->
    <div #viewport class="overflow-hidden motion-safe:transition-[height] motion-safe:duration-(--fz-duration-control) motion-safe:ease-spring">
    <div #content>
    <ng-template ngComboboxPopup [combobox]="combobox">
      @if (count()) {
        <div
          ngListbox
          ngComboboxWidget
          #listbox="ngListbox"
          tabindex="-1"
          focusMode="activedescendant"
          selectionMode="explicit"
          [(value)]="selected"
          [activeDescendant]="listbox.activeDescendant()"
          (click)="commit()"
          (keydown.enter)="commit()"
          (mousedown)="$event.preventDefault()"
          class="flex max-h-80 flex-col gap-1 overflow-y-auto p-1 outline-none"
        >
          @for (section of sections(); track section.group) {
            <div role="presentation">
              @if (section.group; as group) {
                <!-- names the group through aria-labelledby; hidden so it is not read twice -->
                <div [id]="group.id" aria-hidden="true" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">{{ group.heading() }}</div>
              }
              <div role="group" [attr.aria-labelledby]="section.group?.id ?? null" class="flex flex-col gap-0.5">
                @for (item of section.items; track item) {
                  <div
                    ngOption
                    [value]="item.value()"
                    [label]="item.text()"
                    [disabled]="item.disabled()"
                    class="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 outline-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-disabled:opacity-50"
                  >
                    {{ item.text() }}
                    @if (item.shortcut(); as shortcut) {
                      <span class="ms-auto text-xs tracking-widest text-muted-foreground">{{ shortcut }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="py-6 text-center text-muted-foreground">No results.</div>
      }
    </ng-template>
    </div>
    </div>
  `,
})
export class FzCommand<V = unknown> {
  readonly placeholder = input('Type a command or search…');
  /** Accessible name of the search field. */
  readonly label = input('Search');
  readonly itemSelected = output<V>();
  protected readonly query = signal('');
  protected readonly selected = signal<V[]>([]);
  private readonly items = contentChildren(FzCommandItem<V>, { descendants: true });
  private readonly listbox = viewChild<Listbox<V>>('listbox');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  /**
   * Matching items, grouped in the order their group first appears (ungrouped items form a group of
   * their own). Inside a group, label matches come before keyword-only matches.
   */
  protected readonly sections = computed(() => {
    const query = this.query().trim().toLowerCase();
    const sections = new Map<FzCommandGroup | null, { item: FzCommandItem<V>; rank: number }[]>();
    for (const item of this.items()) {
      const label = item.text().toLowerCase();
      const rank = label.startsWith(query) ? 0 : label.includes(query) ? 1 : item.keywords().some((k) => k.toLowerCase().includes(query)) ? 2 : -1;
      if (rank < 0) continue;
      sections.set(item.group, [...(sections.get(item.group) ?? []), { item, rank }]);
    }
    return [...sections].map(([group, list]) => ({ group, items: list.sort((a, b) => a.rank - b.rank).map((m) => m.item) }));
  });
  protected readonly count = computed(() => this.sections().reduce((n, s) => n + s.items.length, 0));

  constructor() {
    // height: auto can't transition: follow the content's height in px instead.
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const viewport = this.viewport().nativeElement;
      const observer = new ResizeObserver(() => (viewport.style.height = `${this.content().nativeElement.offsetHeight}px`));
      observer.observe(this.content().nativeElement);
      destroy.onDestroy(() => observer.disconnect());
    });
    // Highlight the first match after every change of the results, so Enter runs it.
    afterRenderEffect(() => {
      this.sections();
      const listbox = this.listbox();
      untracked(() => listbox?.gotoFirst());
    });
  }

  // Aria's combobox stops every Escape (with the list always shown it does nothing with it): pass it on,
  // so a dialog or popover around the command closes. The CDK dialog still reads keyCode.
  protected forwardEscape() {
    const escape = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
    Object.defineProperty(escape, 'keyCode', { value: 27 });
    this.el.dispatchEvent(escape);
  }

  protected commit() {
    const [value] = this.selected();
    if (value === undefined) return;
    this.selected.set([]); // the same command can run again
    this.itemSelected.emit(value);
  }
}

export const FZ_COMMAND = [FzCommand, FzCommandGroup, FzCommandItem] as const;
