# Date picker

> A button that opens a calendar.

`npx fizzy-ui add date-picker` copies `calendar.ts` into `src/app/ui/` and installs `@angular/cdk`. The same file holds `calendar`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_DATE_PICKER } from './ui/calendar';
import { FZ_FIELD } from './ui/field';
import { FZ_LABEL } from './ui/label';

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
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Open the calendar (focus goes to the picked day, or today) |
| Arrows / Page Up / Page Down | Move in the calendar |
| Enter | Pick and close |
| Escape | Close, focus back on the button |

## Accessibility

- In fzField the button is named "label, date" (aria-labelledby on the label and itself), so the value is read with the label.
- The calendar opens in a dialog labelled "Choose date"; picking or Escape closes it and focus returns to the button.
- No typing a date in: where that matters most, a native <input type="date"> is the better choice.

## Testing

`npx fizzy-ui add date-picker --harness` also copies `calendar.harness.ts`, an Angular CDK test harness: `FzDatePickerHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/calendar.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/calendar.ts (the file `add` copies; its doc comments describe the inputs)
