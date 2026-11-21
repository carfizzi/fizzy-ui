import { Component, input, signal } from '@angular/core';
import { FZ_BUTTON } from '../../registry/ui/button';

/** Copies `text` and says so, visibly and to screen readers. */
@Component({
  selector: 'app-copy-button',
  imports: [FZ_BUTTON],
  template: `
    <button fzButton variant="ghost" size="sm" type="button" [attr.aria-label]="label()" (click)="copy()">
      {{ state() === 'idle' ? 'Copy' : state() === 'copied' ? 'Copied' : 'Copy failed' }}
    </button>
    <span class="sr-only" aria-live="polite">{{ state() === 'copied' ? 'Copied to clipboard' : state() === 'failed' ? 'Copy failed' : '' }}</span>
  `,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copy to clipboard');
  protected readonly state = signal<'idle' | 'copied' | 'failed'>('idle');
  private timer?: ReturnType<typeof setTimeout>;

  protected async copy() {
    try {
      await navigator.clipboard.writeText(this.text());
      this.state.set('copied');
    } catch {
      this.state.set('failed'); // no clipboard (http, denied permission)
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.state.set('idle'), 2000);
  }
}
