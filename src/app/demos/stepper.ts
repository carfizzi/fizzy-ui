import { Component, signal } from '@angular/core';
import { FZ_STEPPER } from '../../../registry/ui/stepper';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';
import { FZ_CHECKBOX } from '../../../registry/ui/checkbox';

@Component({
  imports: [FZ_STEPPER, FZ_BUTTON, FZ_INPUT, FZ_LABEL, FZ_CHECKBOX],
  template: `
    <fz-stepper [(step)]="step" linear aria-label="Checkout" #s="fzStepper" class="w-full max-w-lg">
      <fz-step label="Shipping" [completed]="!!name()">
        <label fzLabel for="ship-name">Full name</label>
        <input fzInput id="ship-name" [value]="name()" (input)="name.set($any($event.target).value)" />
        <div class="flex justify-end"><button fzButton [disabled]="!name()" (click)="s.next()">Next</button></div>
      </fz-step>
      <fz-step label="Payment" [completed]="card()">
        <label fzLabel><input type="checkbox" fzCheckbox [checked]="card()" (change)="card.set($any($event.target).checked)" /> Use the saved card</label>
        <div class="flex justify-between">
          <button fzButton variant="outline" (click)="s.previous()">Back</button>
          <button fzButton [disabled]="!card()" (click)="s.next()">Next</button>
        </div>
      </fz-step>
      <fz-step label="Review">
        <p class="text-sm">Ship to {{ name() }}, pay with the saved card.</p>
        <div class="flex justify-between">
          <button fzButton variant="outline" (click)="s.previous()">Back</button>
          <button fzButton>Place order</button>
        </div>
      </fz-step>
    </fz-stepper>
  `,
})
export class Demo {
  protected readonly step = signal(0);
  protected readonly name = signal('');
  protected readonly card = signal(false);
}
