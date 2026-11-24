import { Component } from '@angular/core';

/** The fizzy-ui mark: bubbles rising in a rounded square. Same path as public/favicon.svg and .github/logo-*.svg. */
@Component({
  selector: 'app-logo',
  host: { class: 'inline-block shrink-0', 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 32 32" class="size-full fill-current">
    <path fill-rule="evenodd" d="M8 0h16a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8ZM5 21a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0ZM18 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0ZM22.25 5.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z" />
  </svg>`,
})
export class Logo {}
