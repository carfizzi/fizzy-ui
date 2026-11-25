# Close button

> An icon button for dismissing a panel or message.

`npx fizzy-ui add close-button` copies `close-button.ts` into `src/app/ui/`.

Sizes: `size="xs|sm|md|lg"` on it, or `data-size` on any container (default `md`).

## Usage

```ts
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FZ_BUTTON } from './ui/button';
import { FZ_CLOSE_BUTTON } from './ui/close-button';

@Component({
  imports: [FZ_BUTTON, FZ_CLOSE_BUTTON],
  template: `
    <div class="grid w-full max-w-md gap-6">
      @if (open()) {
        <div class="flex items-start gap-3 rounded-lg border p-4">
          <div class="grid flex-1 gap-1">
            <p class="text-sm font-medium">New: calendar and date picker</p>
            <p class="text-sm text-muted-foreground">Pick dates with the keyboard, in your locale.</p>
          </div>
          <button fzCloseButton size="sm" aria-label="Dismiss announcement" (click)="dismiss()"></button>
        </div>
      } @else {
        <button fzButton variant="outline" class="justify-self-start" #restore (click)="open.set(true)">Show the announcement</button>
      }
      <div class="flex items-center gap-2" aria-label="Sizes" role="group">
        <button fzCloseButton size="xs"></button>
        <button fzCloseButton size="sm"></button>
        <button fzCloseButton></button>
        <button fzCloseButton size="lg"></button>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly open = signal(true);
  private readonly restore = viewChild<ElementRef<HTMLElement>>('restore');
  private readonly injector = inject(Injector);

  // The button that had focus is gone: give focus to the one that replaces it.
  protected dismiss() {
    this.open.set(false);
    afterNextRender(() => this.restore()?.nativeElement.focus(), { injector: this.injector });
  }
}
```

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Activate |

## Accessibility

- A native button named "Close"; the icon is aria-hidden.
- With several on a page, name what each closes (aria-label="Dismiss announcement").
- When what it closes disappears, move focus somewhere sensible: the demo focuses the button that replaces it.

## Source

https://raw.githubusercontent.com/carfizzi/fizzy-ui/main/registry/ui/close-button.ts (the file `add` copies; its doc comments describe the inputs)
