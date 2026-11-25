# Input OTP

> Boxes for a one-time code.

`npx fizzy-ui add input-otp` copies `input-otp.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_FIELD } from './ui/field';
import { FZ_INPUT_OTP } from './ui/input-otp';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_FIELD, FZ_INPUT_OTP, FZ_LABEL],
  template: `
    <div class="grid gap-8">
      <div fzField>
        <label fzLabel>Verification code</label>
        <fz-input-otp [(value)]="code" (valueChange)="result.set(null)" (complete)="verify($event)" />
        @if (result() === 'wrong') {
          <p fzFieldError>That code doesn't match. Try 123456.</p>
        } @else {
          <p fzFieldDescription>We sent a 6-digit code to your phone.</p>
        }
        <p class="text-sm font-medium" role="status">{{ result() === 'ok' ? 'Verified.' : '' }}</p>
      </div>
      <div fzField>
        <label fzLabel>Recovery key</label>
        <fz-input-otp charset="alphanumeric" [length]="4" size="sm" />
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly code = signal('');
  protected readonly result = signal<'ok' | 'wrong' | null>(null);

  protected verify(code: string) {
    this.result.set(code === '123456' ? 'ok' : 'wrong');
  }
}
```

## Keyboard

| Key | Action |
|---|---|
| 0–9 | Fill the next box |
| Backspace | Clear the last box |
| Ctrl/⌘ + V | Paste a whole code (spaces and dashes are dropped) |
| ← / → | Move through the code, as in any text field |

## Accessibility

- One native text input under the boxes: screen readers read and edit it like any field, and the boxes are aria-hidden.
- autocomplete="one-time-code" lets phones fill the code from an SMS; digits bring up the numeric keyboard.
- Inside fzField the label, hint and error are wired to the input.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/input-otp.ts (the file `add` copies; its doc comments describe the inputs)
