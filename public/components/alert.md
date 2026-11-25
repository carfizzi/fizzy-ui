# Alert

> A callout for a message that needs attention.

`npx fizzy-ui add alert` copies `alert.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_ALERT } from './ui/alert';

@Component({
  imports: [FZ_ALERT],
  template: `
    <div class="grid w-full max-w-md gap-4">
      <div fzAlert role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
        </svg>
        <p fzAlertTitle>Heads up</p>
        <div fzAlertDescription>You can add components to your app with the CLI.</div>
      </div>
      <div fzAlert variant="destructive" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
        </svg>
        <p fzAlertTitle>Payment failed</p>
        <div fzAlertDescription>Check your card details and try again.</div>
      </div>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- role="alert" by default: announced at once when it appears. Use role="status" for a message already on the page, or [role]="null".
- Icons are decorative: mark them aria-hidden.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/alert.ts (the file `add` copies; its doc comments describe the inputs)
