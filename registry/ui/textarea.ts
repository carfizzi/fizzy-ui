import { Directive } from '@angular/core';

@Directive({
  selector: 'textarea[fzTextarea]',
  host: {
    class:
      'flex min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none ' +
      'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
  },
})
export class FzTextarea {}

export const FZ_TEXTAREA = [FzTextarea] as const;
