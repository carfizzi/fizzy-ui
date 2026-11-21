import { Directive } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

@Directive({
  selector: '[fzListbox]',
  hostDirectives: [
    {
      directive: Listbox,
      inputs: ['value', 'multi', 'orientation', 'selectionMode', 'disabled', 'readonly'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    class: 'flex flex-col gap-0.5 rounded-md border bg-background p-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
  },
})
export class FzListbox {}

@Directive({
  selector: '[fzOption]',
  hostDirectives: [{ directive: Option, inputs: ['value', 'label', 'disabled'] }],
  host: {
    class:
      'flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 outline-none ' +
      'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-disabled:opacity-50 ' +
      "aria-selected:font-medium aria-selected:after:content-['✓']",
  },
})
export class FzOption {}

export const FZ_LISTBOX = [FzListbox, FzOption] as const;
