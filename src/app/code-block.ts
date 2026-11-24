import { Component, input } from '@angular/core';
import { CopyButton } from './copy-button';

@Component({
  selector: 'app-code-block',
  imports: [CopyButton],
  template: `
    <div class="relative rounded-md border bg-muted">
      <pre class="max-h-[32rem] overflow-auto p-4 pr-14 text-sm" tabindex="0" role="region" [attr.aria-label]="label()"><code>{{ code() }}</code></pre>
      <app-copy-button icon class="absolute right-2 top-2" [text]="code()" [label]="'Copy ' + label()" />
    </div>
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  /** Names the scrollable region and the copy button. */
  readonly label = input('code');
}
