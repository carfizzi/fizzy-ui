import { Directive } from '@angular/core';

@Directive({
  selector: 'input[fzInput]',
  host: {
    class:
      'flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive ' +
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  },
})
export class FzInput {}

export const FZ_INPUT = [FzInput] as const;
