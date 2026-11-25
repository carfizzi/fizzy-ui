# Combobox

> Autocomplete on your own text input.

`npx fizzy-ui add combobox` copies `combobox.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_COMBOBOX } from './ui/combobox';
import { FZ_LABEL } from './ui/label';

@Component({
  imports: [FZ_COMBOBOX, FZ_LABEL],
  template: `
    <div class="flex flex-col gap-2">
      <label fzLabel for="country">Country</label>
      <input id="country" fzCombobox [options]="countries" [(value)]="country" placeholder="Type a country" class="w-56!" />
      <p class="text-sm text-muted-foreground">Value: {{ country() || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly country = signal('');
  protected readonly countries = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'France', 'Germany', 'Iceland', 'Ireland', 'Italy', 'Japan', 'Norway', 'Portugal', 'Spain', 'Sweden'];
}
```

## Keyboard

| Key | Action |
|---|---|
| Type | Filter the options |
| ↓ / ↑ | Open and move through the options |
| Enter | Pick the active option |
| Escape | Close the list |

## Accessibility

- The input keeps focus; the active option is announced through aria-activedescendant.
- The input is yours, so a <label for> labels it.

## Testing

`npx fizzy-ui add combobox --harness` also copies `combobox.harness.ts`, an Angular CDK test harness: `FzComboboxHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/combobox.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/combobox.ts (the file `add` copies; its doc comments describe the inputs)
