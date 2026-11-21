import { Component, signal } from '@angular/core';
import { FZ_SLIDER } from '../../../registry/ui/slider';

@Component({
  imports: [FZ_SLIDER],
  template: `
    <div class="flex w-full max-w-64 flex-col gap-3 text-sm">
      <label for="volume">Volume: {{ volume() }}</label>
      <input id="volume" type="range" fzSlider min="0" max="100" [value]="volume()" (input)="volume.set(+$any($event.target).value)" />
    </div>
  `,
})
export class Demo {
  protected readonly volume = signal(40);
}
