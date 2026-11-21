import { Component, Directive, input } from '@angular/core';
import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';

@Directive({
  selector: '[fzAccordion]',
  hostDirectives: [{ directive: AccordionGroup, inputs: ['multiExpandable', 'disabled'] }],
  host: { class: 'block w-full divide-y border-y' },
})
export class FzAccordion {}

@Component({
  selector: 'fz-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, AccordionContent],
  host: { class: 'block' },
  template: `
    <h3 class="flex">
      <button
        ngAccordionTrigger
        [panel]="panel"
        [disabled]="disabled()"
        class="group flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {{ title() }}
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </h3>
    <div ngAccordionPanel #panel="ngAccordionPanel" class="pb-4 text-sm [&[inert]]:hidden">
      <ng-template ngAccordionContent><ng-content /></ng-template>
    </div>
  `,
})
export class FzAccordionItem {
  readonly title = input.required<string>();
  readonly disabled = input(false);
}

export const FZ_ACCORDION = [FzAccordion, FzAccordionItem] as const;
