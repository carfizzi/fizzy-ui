import { Component, Directive, computed, inject, input, model } from '@angular/core';

export interface FzSort {
  column: string;
  direction: 'ascending' | 'descending';
}

/**
 * Styles a plain table and everything in it: `<table fzTable>` with thead, tbody, th, td, caption.
 * Wrap it in `<div class="overflow-x-auto">` for narrow screens. Sortable: bind `[(sort)]` and use
 * `<th fzSortHeader="column">` headers; you sort the rows (a `computed` over `sort()`).
 */
@Directive({
  selector: 'table[fzTable]',
  host: {
    class:
      'w-full caption-bottom border-collapse text-sm ' +
      '[&_thead_tr]:border-b [&_tbody_tr]:border-b [&_tbody_tr:last-child]:border-0 [&_tfoot]:border-t [&_tfoot]:bg-muted/50 [&_tfoot]:font-medium ' +
      '[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/50 ' +
      '[&_th]:h-10 [&_th]:px-2 [&_th]:text-left [&_th]:align-middle [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-muted-foreground ' +
      '[&_td]:p-2 [&_td]:align-middle [&_caption]:mt-4 [&_caption]:text-muted-foreground',
  },
})
export class FzTable {
  readonly sort = model<FzSort | undefined>();
}

/**
 * A sortable column header: a button inside the `<th>`, and `aria-sort` on the sorted column.
 * Clicks cycle ascending → descending → unsorted.
 */
@Component({
  selector: 'th[fzSortHeader]',
  host: { '[attr.aria-sort]': 'direction() ?? null' },
  template: `
    <button
      type="button"
      class="-mx-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      (click)="cycle()"
    >
      <ng-content />
      <svg viewBox="0 0 16 16" class="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        @switch (direction()) {
          @case ('ascending') { <path d="M8 13V3M4 7l4-4 4 4" /> }
          @case ('descending') { <path d="M8 3v10M4 9l4 4 4-4" /> }
          @default { <path d="M5 6l3-3 3 3M5 10l3 3 3-3" opacity="0.5" /> }
        }
      </svg>
    </button>
  `,
})
export class FzSortHeader {
  readonly column = input.required<string>({ alias: 'fzSortHeader' });
  private readonly table = inject(FzTable);
  protected readonly direction = computed(() => {
    const sort = this.table.sort();
    return sort?.column === this.column() ? sort.direction : undefined;
  });

  protected cycle() {
    const next = { undefined: 'ascending', ascending: 'descending', descending: undefined } as const;
    const direction = next[this.direction() ?? 'undefined'];
    this.table.sort.set(direction && { column: this.column(), direction });
  }
}

export const FZ_TABLE = [FzTable, FzSortHeader] as const;
