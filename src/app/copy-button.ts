import { Component, booleanAttribute, input, signal } from '@angular/core';
import { FZ_BUTTON } from '../../registry/ui/button';

/** Copies `text` and says so, visibly and to screen readers. */
@Component({
  selector: 'app-copy-button',
  imports: [FZ_BUTTON],
  template: `
    <button fzButton variant="ghost" size="sm" type="button" [icon]="icon()" [attr.aria-label]="label()" (click)="copy()">
      @if (!icon()) {
        {{ state() === 'idle' ? 'Copy' : state() === 'copied' ? 'Copied' : 'Copy failed' }}
      } @else if (state() === 'copied') {
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      } @else {
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
      }
    </button>
    <span class="sr-only" aria-live="polite">{{ state() === 'copied' ? 'Copied to clipboard' : state() === 'failed' ? 'Copy failed' : '' }}</span>
  `,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copy to clipboard');
  /** Square, with a copy glyph that turns into a check (failure is still announced). */
  readonly icon = input(false, { transform: booleanAttribute });
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
