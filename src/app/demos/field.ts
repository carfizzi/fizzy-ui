import { Component, computed, signal } from '@angular/core';
import { FZ_FIELD } from '../../../registry/ui/field';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';
import { FZ_CHECKBOX } from '../../../registry/ui/checkbox';
import { FZ_SELECT } from '../../../registry/ui/select';

@Component({
  imports: [FZ_FIELD, FZ_INPUT, FZ_LABEL, FZ_CHECKBOX, FZ_SELECT],
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <div fzField>
        <label fzLabel>Email</label>
        <input fzInput type="email" [value]="email()" (input)="email.set($any($event.target).value)" (blur)="touched.set(true)" />
        <p fzFieldDescription>We only use it to send receipts.</p>
        @if (touched() && error()) {
          <p fzFieldError>{{ error() }}</p>
        }
      </div>
      <div fzField>
        <label fzLabel>Plan</label>
        <fz-select placeholder="Choose a plan">
          <fz-select-item value="free" label="Free" />
          <fz-select-item value="pro" label="Pro" />
        </fz-select>
      </div>
      <div fzField orientation="horizontal">
        <input type="checkbox" fzCheckbox />
        <label fzLabel>Send me product news</label>
        <p fzFieldDescription>About once a month.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly email = signal('');
  protected readonly touched = signal(false);
  protected readonly error = computed(() =>
    !this.email() ? 'Enter your email.' : this.email().includes('@') ? '' : 'An email needs an @.',
  );
}
