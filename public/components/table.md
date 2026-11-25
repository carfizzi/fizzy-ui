# Table

> A styled table, with sortable columns.

`npx fizzy-ui add table` copies `table.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, computed, signal } from '@angular/core';
import { FZ_TABLE, FzSort } from './ui/table';

interface Invoice {
  id: string;
  status: string;
  amount: number;
}

@Component({
  imports: [FZ_TABLE],
  template: `
    <div class="w-full overflow-x-auto">
      <table fzTable [(sort)]="sort">
        <caption>Recent invoices.</caption>
        <thead>
          <tr>
            <th fzSortHeader="id">Invoice</th>
            <th fzSortHeader="status">Status</th>
            <th fzSortHeader="amount" class="text-right!">Amount</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.id) {
            <tr>
              <td class="font-medium">{{ row.id }}</td>
              <td>{{ row.status }}</td>
              <td class="text-right tabular-nums">{{ row.amount.toFixed(2) }} €</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Demo {
  protected readonly sort = signal<FzSort | undefined>(undefined);
  private readonly invoices: Invoice[] = [
    { id: 'INV001', status: 'Paid', amount: 250 },
    { id: 'INV002', status: 'Pending', amount: 150 },
    { id: 'INV003', status: 'Unpaid', amount: 350 },
    { id: 'INV004', status: 'Paid', amount: 450 },
  ];
  protected readonly rows = computed(() => {
    const sort = this.sort();
    if (!sort) return this.invoices;
    const key = sort.column as keyof Invoice;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...this.invoices].sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
  });
}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Move between sortable headers |
| Enter / Space | Sort by that column |

## Accessibility

- A plain <table>: give it a <caption> or an aria-label.
- Each sortable header holds a button; the sorted column has aria-sort.
- Wrap wide tables in a scrollable container rather than shrinking the text.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/table.ts (the file `add` copies; its doc comments describe the inputs)
