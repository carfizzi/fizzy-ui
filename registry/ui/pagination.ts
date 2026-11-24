import { Component, computed, input, model } from '@angular/core';

/** First, last, the current page and its neighbours; `null` marks a gap. A gap of one page shows that page. */
export function pageItems(page: number, count: number): (number | null)[] {
  const pages = [...new Set([1, page - 1, page, page + 1, count])].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const items: (number | null)[] = [];
  for (const p of pages) {
    const prev = items.at(-1);
    if (typeof prev === 'number' && p - prev === 2) items.push(p - 1);
    else if (typeof prev === 'number' && p - prev > 2) items.push(null);
    items.push(p);
  }
  return items;
}

/**
 * Page buttons: `<fz-pagination [(page)]="page" [pageCount]="20" />` (pages start at 1).
 * A `nav` labelled "Pagination"; the current page has `aria-current="page"`. Previous and Next stay
 * focusable at the ends (`aria-disabled`), so focus is never lost.
 * shortcut: buttons, not links; add an href input if pages need their own URLs.
 */
@Component({
  selector: 'fz-pagination',
  host: { class: 'block' },
  template: `
    <nav [attr.aria-label]="label()">
      <ul class="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <button type="button" [class]="css + ' gap-1 px-2.5'" [attr.aria-disabled]="page() <= 1 || null" (click)="go(page() - 1)">
            <svg viewBox="0 0 16 16" class="size-4 rtl:rotate-180" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 4L6 8l4 4" /></svg>
            Previous
          </button>
        </li>
        <!-- tracked by page number, so the clicked button keeps focus when the list shifts -->
        @for (item of items(); track item ?? 'gap' + $index) {
          <li>
            @if (item === null) {
              <span class="flex size-9 items-center justify-center text-muted-foreground" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                [class]="css + ' w-9'"
                [attr.aria-label]="'Page ' + item"
                [attr.aria-current]="item === page() ? 'page' : null"
                (click)="go(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
        <li>
          <button type="button" [class]="css + ' gap-1 px-2.5'" [attr.aria-disabled]="page() >= pageCount() || null" (click)="go(page() + 1)">
            Next
            <svg viewBox="0 0 16 16" class="size-4 rtl:rotate-180" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 4l4 4-4 4" /></svg>
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class FzPagination {
  readonly page = model(1);
  readonly pageCount = input.required<number>();
  readonly label = input('Pagination');
  protected readonly items = computed(() => pageItems(this.page(), this.pageCount()));
  protected readonly css =
    'inline-flex h-9 cursor-pointer items-center justify-center rounded-md font-medium outline-none transition-colors ' +
    'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
    'aria-[current=page]:border aria-[current=page]:bg-background aria-[current=page]:shadow-xs ' +
    'aria-disabled:pointer-events-none aria-disabled:opacity-50';

  protected go(page: number) {
    if (page >= 1 && page <= this.pageCount()) this.page.set(page);
  }
}

export const FZ_PAGINATION = [FzPagination] as const;
