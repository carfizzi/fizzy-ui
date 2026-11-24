import { Component, computed, signal } from '@angular/core';
import { FZ_TABLE, FzSort } from '../../../registry/ui/table';

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
