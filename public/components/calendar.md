# Calendar

> A month grid to pick a day.

`npx fizzy-ui add calendar` copies `calendar.ts` into `src/app/ui/`. The same file holds `date-picker`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_CALENDAR } from './ui/calendar';

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
```

## Keyboard

| Key | Action |
|---|---|
| ← / → | Previous or next day |
| ↑ / ↓ | Same day of the previous or next week |
| Home / End | Start or end of the week |
| Page Up / Page Down | Previous or next month (with Shift: year) |
| Enter / Space | Pick the day |

## Accessibility

- The APG date grid: one Tab stop on the focused day, a grid labelled by the month heading, which is announced when it changes.
- Each day is named in full ("Sunday, March 15, 2026"); today has aria-current="date"; unavailable days are aria-disabled but still reachable.
- Month, weekday names and the first day of the week follow the app LOCALE_ID.

## Testing

`npx fizzy-ui add calendar --harness` also copies `calendar.harness.ts`, an Angular CDK test harness: `FzCalendarHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/calendar.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/calendar.ts (the file `add` copies; its doc comments describe the inputs)
