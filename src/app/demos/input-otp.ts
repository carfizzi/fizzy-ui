import { Component, signal } from '@angular/core';
import { FZ_FIELD } from '../../../registry/ui/field';
import { FZ_INPUT_OTP } from '../../../registry/ui/input-otp';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_FIELD, FZ_INPUT_OTP, FZ_LABEL],
  template: `
    <div class="grid gap-8">
      <div fzField>
        <label fzLabel>Verification code</label>
        <fz-input-otp [(value)]="code" (valueChange)="result.set(null)" (complete)="verify($event)" />
        @if (result() === 'wrong') {
          <p fzFieldError>That code doesn't match. Try 123456.</p>
        } @else {
          <p fzFieldDescription>We sent a 6-digit code to your phone.</p>
        }
        <p class="text-sm font-medium" role="status">{{ result() === 'ok' ? 'Verified.' : '' }}</p>
      </div>
      <div fzField>
        <label fzLabel>Recovery key</label>
        <fz-input-otp pattern="alphanumeric" [length]="4" size="sm" />
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly code = signal('');
  protected readonly result = signal<'ok' | 'wrong' | null>(null);

  protected verify(code: string) {
    this.result.set(code === '123456' ? 'ok' : 'wrong');
  }
}
