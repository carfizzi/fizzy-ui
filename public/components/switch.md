# Switch

> An on/off toggle on a native checkbox.

`npx fizzy-ui add switch` copies `switch.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_SWITCH } from './ui/switch';

@Component({
  imports: [FZ_SWITCH],
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <label class="flex items-center gap-2">
        <input type="checkbox" fzSwitch [checked]="airplane()" (change)="airplane.set($any($event.target).checked)" /> Airplane mode
      </label>
      <label class="flex items-center gap-2"><input type="checkbox" fzSwitch disabled /> Disabled</label>
      <p class="text-muted-foreground">Airplane mode: {{ airplane() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly airplane = signal(false);
}
```

## Keyboard

| Key | Action |
|---|---|
| Space | Toggle |

## Accessibility

- A checkbox with role="switch", announced as on/off.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/switch.ts (the file `add` copies; its doc comments describe the inputs)
