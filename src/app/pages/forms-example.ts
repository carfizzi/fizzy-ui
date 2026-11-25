import { Component, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_CHIPS } from '../../../registry/ui/chips';
import { FZ_DATE_PICKER } from '../../../registry/ui/calendar';
import { FZ_FIELD } from '../../../registry/ui/field';
import { FZ_LABEL } from '../../../registry/ui/label';
import { FZ_SELECT } from '../../../registry/ui/select';

@Component({
  selector: 'app-forms-example',
  imports: [FormField, FormRoot, FZ_BUTTON, FZ_CHIPS, FZ_DATE_PICKER, FZ_FIELD, FZ_LABEL, FZ_SELECT],
  template: `
    <form [formRoot]="booking" class="grid max-w-sm gap-4">
      <div fzField>
        <label fzLabel>Room</label>
        <fz-select [formField]="booking.room" placeholder="Pick a room">
          <fz-select-item value="single" label="Single" />
          <fz-select-item value="double" label="Double" />
          <fz-select-item value="suite" label="Suite" />
        </fz-select>
        @if (booking.room().touched() && booking.room().invalid()) {
          <p fzFieldError>Pick a room.</p>
        }
      </div>
      <div fzField>
        <label fzLabel>Arrival</label>
        <fz-date-picker [formField]="booking.arrival" />
        @if (booking.arrival().touched() && booking.arrival().invalid()) {
          <p fzFieldError>Pick a date.</p>
        }
      </div>
      <div fzField>
        <label fzLabel>Extras</label>
        <fz-chip-listbox [formField]="booking.extras" multiple>
          <fz-chip value="breakfast" label="Breakfast" />
          <fz-chip value="parking" label="Parking" />
          <fz-chip value="late" label="Late checkout" />
        </fz-chip-listbox>
      </div>
      <div class="flex items-center gap-3">
        <button fzButton type="submit">Book</button>
        <p role="status" class="text-sm text-muted-foreground">{{ booked() }}</p>
      </div>
    </form>
  `,
})
export class FormsExample {
  private readonly model = signal({ room: '', arrival: null as Date | null, extras: [] as string[] });
  protected readonly booked = signal('');
  // Submitting marks every field touched, so the errors show; the action runs only when valid.
  protected readonly booking = form(
    this.model,
    (p) => {
      required(p.room);
      required(p.arrival);
    },
    { submission: { action: async (f) => (this.booked.set(`Booked a ${f.room().value()} room.`), undefined) } },
  );
}
