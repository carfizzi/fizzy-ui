# Label

> A styled native label.

`npx fizzy-ui add label` copies `label.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_LABEL } from './ui/label';
import { FZ_CHECKBOX } from './ui/checkbox';

@Component({
  imports: [FZ_LABEL, FZ_CHECKBOX],
  template: `
    <div class="flex items-center gap-2">
      <input type="checkbox" fzCheckbox id="demo-terms" />
      <label fzLabel for="demo-terms">Accept terms and conditions</label>
    </div>
  `,
})
export class Demo {}
```

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/label.ts (the file `add` copies; its doc comments describe the inputs)
