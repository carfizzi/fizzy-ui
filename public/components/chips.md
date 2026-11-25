# Chips

> Compact choices to pick from, or tags to type.

`npx fizzy-ui add chips` copies `chips.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_CHIPS } from './ui/chips';
import { FZ_FIELD } from './ui/field';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_CHIPS, FZ_FIELD, FZ_LABEL],
  template: `
    <div class="grid w-full max-w-md gap-6 text-sm">
      <div class="grid gap-2">
        <fz-chip-listbox multiple [(value)]="diet" aria-label="Diet">
          <fz-chip value="vegetarian" label="Vegetarian" />
          <fz-chip value="vegan" label="Vegan" />
          <fz-chip value="gluten-free" label="Gluten-free" />
          <fz-chip value="halal" label="Halal" disabled />
        </fz-chip-listbox>
        <p class="text-muted-foreground">Diet: {{ diet().join(', ') || 'none' }}</p>
      </div>
      <div fzField>
        <label fzLabel>Tags</label>
        <fz-chip-input [(value)]="tags" placeholder="Add a tag…" />
        <p fzFieldDescription>Press Enter or a comma to add one.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly diet = signal(['vegetarian']);
  protected readonly tags = signal(['angular', 'a11y']);
}
```

## Keyboard

| Key | Action |
|---|---|
| ← / → | Move between chips (chip listbox) |
| Space | Toggle the focused chip |
| Enter / , | Add the typed tag (chip input) |
| Backspace | In the empty input, remove the last tag |

## Accessibility

- A chip listbox is a horizontal listbox with one Tab stop; aria-label goes on fz-chip-listbox and moves to the listbox.
- A chip input is a real <input>: label it with fzField or aria-label. Each tag has a "Remove …" button.
- Added and removed tags are announced, since the input itself does not change.

## Testing

`npx fizzy-ui add chips --harness` also copies `chips.harness.ts`, an Angular CDK test harness: `FzChipListboxHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/chips.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/chips.ts (the file `add` copies; its doc comments describe the inputs)
