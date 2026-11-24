import { Component, signal } from '@angular/core';
import { FZ_CALENDAR } from '../../../registry/ui/calendar';

@Component({
  imports: [FZ_CALENDAR],
  template: `
    <div class="grid justify-items-center gap-3">
      <fz-calendar [(value)]="date" class="rounded-lg border p-3" />
      <p class="text-sm text-muted-foreground">Picked: {{ date()?.toDateString() ?? 'nothing' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly date = signal<Date | undefined>(new Date());
}
