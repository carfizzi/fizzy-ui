import { Component } from '@angular/core';
import { FZ_KBD } from '../../../registry/ui/kbd';

@Component({
  imports: [FZ_KBD],
  template: `
    <div class="grid gap-3 text-sm">
      <p>Open the search with <kbd fzKbd><kbd fzKbd>Ctrl</kbd>+<kbd fzKbd>K</kbd></kbd>.</p>
      <p>
        On a Mac, <kbd fzKbd><kbd fzKbd><span aria-hidden="true">⌘</span><span class="sr-only">Command</span></kbd>+<kbd fzKbd>K</kbd></kbd>.
      </p>
      <p>Close it with <kbd fzKbd>Esc</kbd>.</p>
    </div>
  `,
})
export class Demo {}
