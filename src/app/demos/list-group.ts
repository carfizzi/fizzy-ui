import { Component, signal } from '@angular/core';
import { FZ_LIST_GROUP } from '../../../registry/ui/list-group';

@Component({
  imports: [FZ_LIST_GROUP],
  template: `
    <div class="grid w-full max-w-sm gap-6">
      <ul fzListGroup aria-label="Plan features">
        <li fzListGroupItem>Unlimited projects</li>
        <li fzListGroupItem>
          <div class="grid gap-0.5">
            <span class="font-medium">Priority support</span>
            <span class="text-muted-foreground">Answers within a day.</span>
          </div>
        </li>
        <li fzListGroupItem>Custom domains</li>
      </ul>
      <div fzListGroup role="group" aria-label="Folders">
        @for (f of folders; track f) {
          <button fzListGroupItem [attr.aria-current]="f === folder() || null" (click)="folder.set(f)">{{ f }}</button>
        }
        <button fzListGroupItem disabled>Archive</button>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly folders = ['Inbox', 'Drafts', 'Sent'];
  protected readonly folder = signal('Inbox');
}
