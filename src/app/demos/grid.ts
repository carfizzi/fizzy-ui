import { Component, computed, signal } from '@angular/core';
import { FZ_GRID } from '../../../registry/ui/grid';

@Component({
  imports: [FZ_GRID],
  template: `
    <div class="flex w-full max-w-md flex-col gap-2">
      <div class="rounded-md border">
        <table fzGrid aria-label="Team" [enableSelection]="true" selectionMode="explicit">
          <tr fzGridRow>
            <th fzGridCell role="columnheader">Name</th>
            <th fzGridCell role="columnheader">Role</th>
            <th fzGridCell role="columnheader">City (editable)</th>
          </tr>
          @for (person of people(); track person.name) {
            <tr fzGridRow class="last:border-b-0">
              <td fzGridCell>{{ person.name }}</td>
              <td fzGridCell [disabled]="person.role === 'Retired'">{{ person.role }}</td>
              <td fzGridCell>
                <input
                  fzGridCellInput
                  widgetType="editable"
                  [attr.aria-label]="person.name + ' city'"
                  [value]="person.city"
                  (change)="setCity(person.name, $any($event.target).value)"
                />
              </td>
            </tr>
          }
        </table>
      </div>
      <p class="text-sm text-muted-foreground">Cities: {{ cities() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly people = signal([
    { name: 'Ada', role: 'Engineer', city: 'London' },
    { name: 'Grace', role: 'Admiral', city: 'Arlington' },
    { name: 'Alan', role: 'Retired', city: 'Wilmslow' },
  ]);
  protected readonly cities = computed(() => this.people().map((p) => p.city).join(', '));
  protected setCity(name: string, city: string) {
    this.people.update((list) => list.map((p) => (p.name === name ? { ...p, city } : p)));
  }
}
