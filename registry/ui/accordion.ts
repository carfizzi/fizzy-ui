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
        class="group flex flex-1 items-center justify-between gap-4 py-4 text-start text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {{ title() }}
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground transition-transform duration-(--fz-duration-popup) ease-spring group-aria-expanded:rotate-180" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </h3>
    <!-- Height animates through grid rows (0fr <-> 1fr); preserveContent keeps the content for the collapse. -->
    <div
      ngAccordionPanel
      #panel="ngAccordionPanel"
      [preserveContent]="true"
      class="grid grid-rows-[1fr] text-sm transition-[grid-template-rows] duration-(--fz-duration-popup) ease-spring motion-reduce:transition-none [&[inert]]:grid-rows-[0fr]"
    >
      <!-- overflow-hidden clips during the animation: -mx-1 px-1 and pt-1 leave room for focus rings. -->
      <div class="-mx-1 min-h-0 overflow-hidden px-1">
        <div class="pt-1 pb-4"><ng-template ngAccordionContent><ng-content /></ng-template></div>
      </div>
    </div>
  `,
})
export class FzAccordionItem {
  readonly title = input.required<string>();
  readonly disabled = input(false);
}

export const FZ_ACCORDION = [FzAccordion, FzAccordionItem] as const;
