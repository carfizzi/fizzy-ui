import { Component, signal } from '@angular/core';
import { FZ_PROGRESS } from '../../../registry/ui/progress';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_PROGRESS, FZ_BUTTON],
  template: `
    <div class="grid w-full max-w-sm gap-4 text-sm">
      <label for="upload" class="flex justify-between">Uploading <span class="text-muted-foreground">{{ value() }}%</span></label>
      <progress fzProgress id="upload" [value]="value()" max="100"></progress>
      <button fzButton variant="outline" size="sm" class="w-fit" (click)="value.set((value() + 25) % 125)">Advance</button>
      <progress fzProgress aria-label="Loading"></progress>
    </div>
  `,
})
export class Demo {
  protected readonly value = signal(25);
}
