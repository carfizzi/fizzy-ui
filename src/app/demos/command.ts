import { Component, signal } from '@angular/core';
import { FZ_COMMAND } from '../../../registry/ui/command';

@Component({
  imports: [FZ_COMMAND],
  template: `
    <div class="grid w-full max-w-md gap-2">
      <fz-command class="shadow-md" (itemSelected)="ran.set($any($event))">
        <fz-command-group heading="Suggestions">
          <fz-command-item value="calendar" label="Calendar" [keywords]="['events', 'schedule']" />
          <fz-command-item value="emoji" label="Search emoji" />
          <fz-command-item value="calculator" label="Calculator" disabled />
        </fz-command-group>
        <fz-command-group heading="Settings">
          <fz-command-item value="profile" label="Profile" shortcut="⌘P" />
          <fz-command-item value="billing" label="Billing" shortcut="⌘B" />
          <fz-command-item value="settings" label="Settings" shortcut="⌘S" [keywords]="['preferences']" />
        </fz-command-group>
      </fz-command>
      <p class="text-sm text-muted-foreground">Last command: {{ ran() ?? 'none' }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly ran = signal<string | undefined>(undefined);
}
