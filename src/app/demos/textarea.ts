import { Component } from '@angular/core';
import { FZ_TEXTAREA } from '../../../registry/ui/textarea';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_TEXTAREA, FZ_LABEL],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <label fzLabel for="demo-message">Message</label>
      <textarea fzTextarea id="demo-message" placeholder="Type your message here."></textarea>
    </div>
  `,
})
export class Demo {}
