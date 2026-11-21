import { Component } from '@angular/core';
import { FZ_CARD } from '../../../registry/ui/card';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_CARD, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <form fzCard class="w-full max-w-sm">
      <div fzCardHeader>
        <h3 fzCardTitle>Contact</h3>
        <p fzCardDescription>We reply within a day.</p>
      </div>
      <div fzCardContent class="flex flex-col gap-2">
        <label fzLabel for="card-email">Email</label>
        <input fzInput id="card-email" type="email" placeholder="you@example.com" />
      </div>
      <div fzCardFooter class="justify-end">
        <button fzButton type="button" variant="outline">Cancel</button>
        <button fzButton type="button">Send</button>
      </div>
    </form>
  `,
})
export class Demo {}
