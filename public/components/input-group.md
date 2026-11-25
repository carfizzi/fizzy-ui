# Input group

> An input with text, icons or buttons inside its border.

`npx fizzy-ui add input-group` copies `input-group.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_INPUT_GROUP } from './ui/input-group';
import { FZ_FIELD } from './ui/field';
import { FZ_LABEL } from './ui/label';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_INPUT_GROUP, FZ_FIELD, FZ_LABEL, FZ_BUTTON],
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <div fzField>
        <label fzLabel>Website</label>
        <div fzInputGroup>
          <span fzInputGroupAddon>https://</span>
          <input fzInputGroupInput placeholder="example.com" />
        </div>
      </div>
      <div fzField>
        <label fzLabel>Price (EUR)</label>
        <div fzInputGroup>
          <span fzInputGroupAddon>€</span>
          <input fzInputGroupInput inputmode="decimal" value="12.00" />
          <span fzInputGroupAddon>EUR</span>
        </div>
      </div>
      <div fzInputGroup>
        <span fzInputGroupAddon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </span>
        <input fzInputGroupInput type="search" aria-label="Search" placeholder="Search…" [value]="query()" (input)="query.set($any($event.target).value)" />
        @if (query()) {
          <span fzInputGroupAddon><button fzButton variant="ghost" size="xs" (click)="query.set('')">Clear</button></span>
        }
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly query = signal('');
}
```

## Accessibility

- The inner input is the control: label it with fzField, a <label for>, or aria-label.
- Addon text is not read with the input: repeat units or prefixes that matter in the label.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/input-group.ts (the file `add` copies; its doc comments describe the inputs)
