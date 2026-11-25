# Slider

> A styled native range input.

`npx fizzy-ui add slider` copies `slider.ts` into `src/app/ui/`.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { FZ_SLIDER } from './ui/slider';

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
```

## Keyboard

| Key | Action |
|---|---|
| ← → ↑ ↓ | Step down or up |
| Page Up / Page Down | Bigger step |
| Home / End | Minimum or maximum |

## Accessibility

- A native <input type="range">: label it with <label for>.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/slider.ts (the file `add` copies; its doc comments describe the inputs)
