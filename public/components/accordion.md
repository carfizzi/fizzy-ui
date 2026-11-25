# Accordion

> Stacked headings that show and hide a section of content.

`npx fizzy-ui add accordion` copies `accordion.ts` into `src/app/ui/` and installs `@angular/aria`, `@angular/cdk`.

## Usage

```ts
import { Component } from '@angular/core';
import { FZ_ACCORDION } from './ui/accordion';

@Component({
  imports: [FZ_ACCORDION],
  template: `
    <div fzAccordion class="w-full max-w-md">
      <fz-accordion-item title="Is it accessible?">Yes. Behavior and ARIA come from &#64;angular/aria.</fz-accordion-item>
      <fz-accordion-item title="Is it styled?">Yes, with Tailwind and CSS variables you own.</fz-accordion-item>
      <fz-accordion-item title="Disabled item" [disabled]="true">Hidden.</fz-accordion-item>
    </div>
  `,
})
export class Demo {}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Expand or collapse the focused section |
| ↓ / ↑ | Move between headings |
| Home / End | First or last heading |

## Accessibility

- Each heading is a button with aria-expanded and aria-controls pointing at its region.
- Collapsed panels are inert, so their content is out of the tab order.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/accordion.ts (the file `add` copies; its doc comments describe the inputs)
