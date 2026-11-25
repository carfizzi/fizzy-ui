# Select

> Pick one value from a popup list.

`npx fizzy-ui add select` copies `select.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`. The same file holds `multiselect`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_SELECT } from './ui/select';

@Component({
  imports: [FZ_SELECT],
  template: `
    <div class="flex flex-col gap-2">
      <span id="framework-label" class="text-sm font-medium">Framework</span>
      <fz-select [(value)]="framework" placeholder="Pick a framework" aria-labelledby="framework-label" class="w-56!">
        <fz-select-item value="angular" label="Angular" />
        <fz-select-item value="react" label="React" />
        <fz-select-item value="vue" label="Vue" />
        <fz-select-item value="ember" label="Ember (disabled)" disabled />
        <fz-select-item value="svelte" label="Svelte" />
      </fz-select>
      <p class="text-sm text-muted-foreground">Value: {{ framework() ?? '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly framework = signal<string | undefined>(undefined);
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space / ↓ | Open |
| ↓ / ↑ | Move through options |
| Enter | Pick and close |
| Type | Jump to an option by label |
| Escape | Close |

## Accessibility

- Focus stays on the trigger; label it with aria-labelledby.

## Testing

`npx fizzy-ui add select --harness` also copies `select.harness.ts`, an Angular CDK test harness: `FzSelectHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/select.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/select.ts (the file `add` copies; its doc comments describe the inputs)
