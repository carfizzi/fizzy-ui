# Field

> A label, a control, a hint and an error, wired together.

`npx fizzy-ui add field` copies `field.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, computed, signal } from '@angular/core';
import { FZ_FIELD } from './ui/field';
import { FZ_INPUT } from './ui/input';
import { FZ_LABEL } from './ui/label';
import { FZ_CHECKBOX } from './ui/checkbox';
import { FZ_SELECT } from './ui/select';

@Component({
  imports: [FZ_FIELD, FZ_INPUT, FZ_LABEL, FZ_CHECKBOX, FZ_SELECT],
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <div fzField>
        <label fzLabel>Email</label>
        <input fzInput type="email" [value]="email()" (input)="email.set($any($event.target).value)" (blur)="touched.set(true)" />
        <p fzFieldDescription>We only use it to send receipts.</p>
        @if (touched() && error()) {
          <p fzFieldError>{{ error() }}</p>
        }
      </div>
      <div fzField>
        <label fzLabel>Plan</label>
        <fz-select placeholder="Choose a plan">
          <fz-select-item value="free" label="Free" />
          <fz-select-item value="pro" label="Pro" />
        </fz-select>
      </div>
      <div fzField orientation="horizontal">
        <input type="checkbox" fzCheckbox />
        <label fzLabel>Send me product news</label>
        <p fzFieldDescription>About once a month.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly email = signal('');
  protected readonly touched = signal(false);
  protected readonly error = computed(() =>
    !this.email() ? 'Enter your email.' : this.email().includes('@') ? '' : 'An email needs an @.',
  );
}
```

## Accessibility

- The label names the control (for, or aria-labelledby for controls like select), and the hint and error describe it with aria-describedby.
- While an error is shown the control is aria-invalid, and the error (role="alert") is read when it appears.
- Show errors after the user leaves the field or submits, not on every keystroke.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/field.ts (the file `add` copies; its doc comments describe the inputs)
