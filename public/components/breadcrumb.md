# Breadcrumb

> Shows where the page sits in the site.

`npx fizzy-ui add breadcrumb` copies `breadcrumb.ts` into `src/app/ui/`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_BREADCRUMB } from './ui/breadcrumb';

@Component({
  imports: [FZ_BREADCRUMB],
  template: `
    <nav fzBreadcrumb>
      <ol>
        <li><a href="introduction">Home</a></li>
        <li><a href="components/accordion">Components</a></li>
        <li><span aria-current="page">Breadcrumb</span></li>
      </ol>
    </nav>
  `,
})
export class Demo {}
```

## Accessibility

- A nav labelled "Breadcrumb" around an ordered list.
- Separators are drawn with CSS borders, so screen readers do not read them.
- Mark the current page with aria-current="page".

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/breadcrumb.ts (the file `add` copies; its doc comments describe the inputs)
