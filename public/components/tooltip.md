# Tooltip

> A short hint on hover or keyboard focus.

`npx fizzy-ui add tooltip` copies `tooltip.ts` into `src/app/ui/` and installs `@angular/cdk`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_TOOLTIP } from './ui/tooltip';
import { FZ_BUTTON } from './ui/button';

@Component({
  imports: [FZ_TOOLTIP, FZ_BUTTON],
  template: `<button fzButton variant="outline" fzTooltip="Copies the link to your clipboard">Hover or focus me</button>`,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Tab | Focus the trigger to show it |
| Escape | Hide it |

## Accessibility

- Wired with aria-describedby, so it is read as the trigger's description.
- Hint text only: no links or buttons inside.

## Testing

`npx fizzy-ui add tooltip --harness` also copies `tooltip.harness.ts`, an Angular CDK test harness: `FzTooltipHarness` (methods documented in https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/testing/tooltip.harness.ts).

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/tooltip.ts (the file `add` copies; its doc comments describe the inputs)
