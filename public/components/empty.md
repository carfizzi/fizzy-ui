# Empty

> What to show when there is nothing here yet.

`npx fizzy-ui add empty` copies `empty.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_BUTTON } from './ui/button';
import { FZ_EMPTY } from './ui/empty';

@Component({
  imports: [FZ_BUTTON, FZ_EMPTY],
  template: `
    <div fzEmpty class="max-w-lg">
      <div fzEmptyMedia>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </div>
      <h3 fzEmptyTitle>No projects yet</h3>
      <p fzEmptyDescription>Create your first project, or import one you already have.</p>
      <div class="flex gap-2">
        <button fzButton>Create project</button>
        <button fzButton variant="outline">Import</button>
      </div>
    </div>
  `,
})
export class Demo {}
```

## Accessibility

- Use a real heading for fzEmptyTitle, at the level that fits the page.
- The icon is decorative: mark it aria-hidden.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/empty.ts (the file `add` copies; its doc comments describe the inputs)
