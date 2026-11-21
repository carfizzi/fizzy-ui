import { Component } from '@angular/core';
import { FZ_ACCORDION } from '../../../registry/ui/accordion';

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
