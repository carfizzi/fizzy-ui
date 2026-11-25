# Listbox

> An inline list of options with single or multiple selection.

`npx fizzy-ui add listbox` copies `listbox.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_LISTBOX } from './ui/listbox';

@Component({
  imports: [FZ_LISTBOX],
  template: `
    <div class="flex flex-col gap-2">
      <ul fzListbox multi selectionMode="explicit" [(value)]="fruits" aria-label="Fruits" class="w-56">
        @for (f of options; track f) {
          <li fzOption [value]="f" [label]="f">{{ f }}</li>
        }
      </ul>
      <p class="text-sm text-muted-foreground">Selected: {{ fruits().join(', ') || '—' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly options = ['apple', 'banana', 'cherry', 'durian'];
  protected readonly fruits = signal<string[]>(['apple']);
}
```

## Keyboard

| Key | Action |
|---|---|
| ↓ / ↑ | Move through options |
| Home / End | First or last option |
| Space | Toggle the option (explicit mode) |
| Type | Jump to an option by label |

## Accessibility

- Give the list an aria-label or aria-labelledby.

## Testing

`npx fizzy-ui add listbox --harness` also copies `listbox.harness.ts`, an Angular CDK test harness: `FzListboxHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/listbox.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/listbox.ts (the file `add` copies; its doc comments describe the inputs)
