# Radio group

> Styled native radios in a labelled group.

`npx fizzy-ui add radio-group` copies `radio-group.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_RADIO_GROUP } from './ui/radio-group';

@Component({
  imports: [FZ_RADIO_GROUP],
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <div fzRadioGroup aria-label="Plan">
        @for (p of plans; track p) {
          <label class="flex items-center gap-2">
            <input type="radio" fzRadio name="plan" [value]="p" [checked]="plan() === p" (change)="plan.set(p)" /> {{ p }}
          </label>
        }
      </div>
      <p class="text-muted-foreground">Plan: {{ plan() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly plans = ['Free', 'Pro', 'Team'];
  protected readonly plan = signal('Pro');
}
```

## Keyboard

| Key | Action |
|---|---|
| ← → ↑ ↓ | Move to and select the next radio |

## Accessibility

- Radios sharing a name form one Tab stop. Label the group with aria-label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/radio-group.ts (the file `add` copies; its doc comments describe the inputs)
