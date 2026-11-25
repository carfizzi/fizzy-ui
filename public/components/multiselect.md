# Multiselect

> A select that keeps several values.

`npx fizzy-ui add multiselect` copies `select.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `select`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_MULTISELECT } from './ui/select';

@Component({
  imports: [FZ_MULTISELECT],
  template: `
    <div class="flex flex-col gap-2">
      <span id="toppings-label" class="text-sm font-medium">Toppings</span>
      <fz-multiselect [(value)]="toppings" placeholder="Pick toppings" aria-labelledby="toppings-label" class="w-56!">
        <fz-select-item value="cheese" label="Cheese" />
        <fz-select-item value="mushrooms" label="Mushrooms" />
        <fz-select-item value="olives" label="Olives" />
        <fz-select-item value="pineapple" label="Pineapple (sold out)" disabled />
        <fz-select-item value="basil" label="Basil" />
      </fz-multiselect>
      <p class="text-sm text-muted-foreground">Value: {{ toppings().join(', ') || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly toppings = signal<string[]>(['cheese']);
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space / ↓ | Open |
| ↓ / ↑ | Move through options |
| Space / Enter | Toggle the option, the list stays open |
| Escape | Close |

## Accessibility

- Label it with aria-labelledby.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/select.ts (the file `add` copies; its doc comments describe the inputs)
