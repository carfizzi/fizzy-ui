import { Component, signal } from '@angular/core';
import { FZ_DATE_PICKER } from '../../../registry/ui/calendar';
import { FZ_FIELD } from '../../../registry/ui/field';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_DATE_PICKER, FZ_FIELD, FZ_LABEL],
  template: `
    <div class="grid w-full max-w-xs gap-6">
      <div fzField>
        <label fzLabel>Date of birth</label>
        <fz-date-picker [(value)]="birth" [max]="today" />
      </div>
      <div fzField>
        <label fzLabel>Appointment</label>
        <fz-date-picker [(value)]="appointment" [min]="today" [dateDisabled]="weekend" placeholder="Pick a weekday" />
        <p fzFieldDescription>Weekdays only, from today.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly today = new Date();
  protected readonly birth = signal<Date | undefined>(undefined);
  protected readonly appointment = signal<Date | undefined>(undefined);
  protected readonly weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
}
