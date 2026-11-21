import { Component } from '@angular/core';
import { FZ_SEPARATOR } from '../../../registry/ui/separator';

@Component({
  imports: [FZ_SEPARATOR],
  template: `
    <div class="w-full max-w-sm">
      <p class="text-sm font-medium">fizzy-ui</p>
      <p class="text-sm text-muted-foreground">Accessible Angular components.</p>
      <div fzSeparator class="my-4"></div>
      <div class="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <div fzSeparator orientation="vertical"></div>
        <span>Source</span>
      </div>
    </div>
  `,
})
export class Demo {}
