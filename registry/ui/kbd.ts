import { Directive } from '@angular/core';

/**
 * A key, in a shortcut or an instruction: `<kbd fzKbd>Esc</kbd>`. For a combination, nest them as the
 * HTML spec does: `<kbd fzKbd><kbd fzKbd>Ctrl</kbd>+<kbd fzKbd>K</kbd></kbd>`; the outer one only spaces
 * its keys. Screen readers read symbols oddly (⌘ is "place of interest"): prefer words, or pair a symbol
 * with visually hidden text.
 */
@Directive({
  selector: 'kbd[fzKbd]',
  host: {
    class:
      'inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground ' +
      // a combination: the keys draw themselves
      'has-[kbd]:h-auto has-[kbd]:min-w-0 has-[kbd]:border-0 has-[kbd]:bg-transparent has-[kbd]:px-0',
  },
})
export class FzKbd {}

export const FZ_KBD = [FzKbd] as const;
