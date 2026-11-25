# Stepper

> Breaks a task into ordered steps.

`npx fizzy-ui add stepper` copies `stepper.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_STEPPER } from './ui/stepper';
import { FZ_BUTTON } from './ui/button';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';
import { FZ_CHECKBOX } from './ui/checkbox';

@Component({
  imports: [FZ_STEPPER, FZ_BUTTON, FZ_INPUT, FZ_LABEL, FZ_CHECKBOX],
  template: `
    <fz-stepper [(step)]="step" linear aria-label="Checkout" #s="fzStepper" class="w-full max-w-lg">
      <fz-step label="Shipping" [completed]="!!name()">
        <label fzLabel for="ship-name">Full name</label>
        <input fzInput id="ship-name" [value]="name()" (input)="name.set($any($event.target).value)" />
        <div class="flex justify-end"><button fzButton [disabled]="!name()" (click)="s.next()">Next</button></div>
      </fz-step>
      <fz-step label="Payment" [completed]="card()">
        <label fzLabel><input type="checkbox" fzCheckbox [checked]="card()" (change)="card.set($any($event.target).checked)" /> Use the saved card</label>
        <div class="flex justify-between">
          <button fzButton variant="outline" (click)="s.previous()">Back</button>
          <button fzButton [disabled]="!card()" (click)="s.next()">Next</button>
        </div>
      </fz-step>
      <fz-step label="Review">
        <p class="text-sm">Ship to {{ name() }}, pay with the saved card.</p>
        <div class="flex justify-between">
          <button fzButton variant="outline" (click)="s.previous()">Back</button>
          <button fzButton>Place order</button>
        </div>
      </fz-step>
    </fz-stepper>
  `,
})
export class Demo {
  protected readonly step = signal(0);
  protected readonly name = signal('');
  protected readonly card = signal(false);
}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Move between step headers and the step content |
| Enter / Space | Go to that step (if it is open) |

## Accessibility

- The headers are an ordered list of buttons named "Step n of N: label", with ", completed" when done; the current one has aria-current="step".
- In linear mode, steps that are not open yet are aria-disabled: still reachable, so the whole task can be read ahead.
- next() and previous() move focus to the new step header, so the change is announced. Each step is a group named by its header.

## Testing

`npx fizzy-ui add stepper --harness` also copies `stepper.harness.ts`, an Angular CDK test harness: `FzStepperHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/stepper.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/stepper.ts (the file `add` copies; its doc comments describe the inputs)
