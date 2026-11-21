import { Component, signal } from '@angular/core';
import { FZ_SWITCH } from '../../../registry/ui/switch';

@Component({
  imports: [FZ_SWITCH],
  template: `
    <div class="flex flex-col gap-3 text-sm">
      <label class="flex items-center gap-2">
        <input type="checkbox" fzSwitch [checked]="airplane()" (change)="airplane.set($any($event.target).checked)" /> Airplane mode
      </label>
      <label class="flex items-center gap-2"><input type="checkbox" fzSwitch disabled /> Disabled</label>
      <p class="text-muted-foreground">Airplane mode: {{ airplane() }}</p>
    </div>
  `,
})
export class Demo {
  protected readonly airplane = signal(false);
}
