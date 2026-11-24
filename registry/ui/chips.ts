import { Component, Directive, ElementRef, booleanAttribute, computed, contentChildren, inject, input, model, viewChild } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';
import { LiveAnnouncer } from '@angular/cdk/a11y';

/** One option of `fz-chip-listbox`, read as data: `<fz-chip value="vegan" label="Vegan" />`. */
@Directive({ selector: 'fz-chip' })
export class FzChip<V = unknown> {
  readonly value = input.required<V>();
  readonly label = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly text = computed(() => this.label() ?? String(this.value()));
}

/**
 * Chips to pick from: `<fz-chip-listbox [(value)]="diet" multiple aria-label="Diet">` with `<fz-chip>`s.
 * A horizontal listbox with one Tab stop: arrows move, Space or a click toggles a chip. The value is
 * always an array (one item at most without `multiple`).
 */
@Component({
  selector: 'fz-chip-listbox',
  imports: [Listbox, Option],
  // The listbox is inside: its label moves there, off the host.
  host: { class: 'block', '[attr.aria-label]': 'null', '[attr.aria-labelledby]': 'null' },
  template: `
    <div
      ngListbox
      orientation="horizontal"
      selectionMode="explicit"
      [multi]="multiple()"
      [disabled]="disabled()"
      [(value)]="value"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      class="flex flex-wrap gap-2 rounded-md outline-none aria-disabled:opacity-50"
    >
      @for (chip of chips(); track chip.value()) {
        <div
          ngOption
          [value]="chip.value()"
          [label]="chip.text()"
          [disabled]="chip.disabled()"
          class="inline-flex h-8 cursor-default select-none items-center gap-1.5 rounded-full border bg-background px-3 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:before:content-['✓'] aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {{ chip.text() }}
        </div>
      }
    </div>
  `,
})
export class FzChipListbox<V = unknown> {
  readonly value = model<V[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  protected readonly chips = contentChildren(FzChip<V>);
}

/**
 * Free-form tags: `<fz-chip-input [(value)]="tags" aria-label="Tags" />`, or inside `fzField` with a label.
 * Enter or a comma adds what was typed (trimmed, no duplicates); Backspace in the empty input removes
 * the last tag; each tag has a remove button. Additions and removals are announced.
 */
@Component({
  selector: 'fz-chip-input',
  host: {
    '[attr.aria-label]': 'null',
    class:
      'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-sm shadow-xs ' +
      'focus-within:ring-2 focus-within:ring-ring has-[input[aria-invalid=true]]:border-destructive',
  },
  template: `
    @if (value().length) {
      <ul class="contents">
        @for (tag of value(); track tag) {
          <li class="inline-flex h-6 items-center gap-1 rounded-full bg-secondary pr-0.5 pl-2.5 text-xs font-medium text-secondary-foreground">
            {{ tag }}
            <button
              type="button"
              [attr.aria-label]="'Remove ' + tag"
              class="inline-flex size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              (click)="remove(tag, true)"
            >
              <svg viewBox="0 0 16 16" class="size-3" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </li>
        }
      </ul>
    }
    <input
      #field
      [attr.id]="inputId() ?? null"
      [attr.aria-label]="ariaLabel() ?? null"
      [placeholder]="placeholder()"
      class="h-7 min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      (keydown)="onKeydown($event)"
      (blur)="add()"
    />
  `,
})
export class FzChipInput {
  readonly value = model<string[]>([]);
  readonly placeholder = input('');
  /** Id of the inner input, for a `<label for>` outside `fzField`. */
  readonly inputId = input<string>();
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly announcer = inject(LiveAnnouncer);

  protected onKeydown(event: KeyboardEvent) {
    const input = this.field().nativeElement;
    if (event.key === 'Enter' || event.key === ',') {
      if (input.value.trim()) event.preventDefault(); // an empty Enter still submits the form
      this.add();
    } else if (event.key === 'Backspace' && !input.value && this.value().length) {
      this.remove(this.value().at(-1)!);
    }
  }

  protected add() {
    const input = this.field().nativeElement;
    const tag = input.value.trim();
    input.value = '';
    if (!tag || this.value().includes(tag)) return;
    this.value.update((tags) => [...tags, tag]);
    void this.announcer.announce(`Added ${tag}`);
  }

  protected remove(tag: string, refocus = false) {
    this.value.update((tags) => tags.filter((t) => t !== tag));
    void this.announcer.announce(`Removed ${tag}`);
    if (refocus) this.field().nativeElement.focus(); // its button is gone
  }
}

export const FZ_CHIPS = [FzChipListbox, FzChip, FzChipInput] as const;
