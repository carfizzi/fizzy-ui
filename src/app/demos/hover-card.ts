import { Component } from '@angular/core';
import { FZ_HOVER_CARD } from '../../../registry/ui/hover-card';
import { FZ_AVATAR } from '../../../registry/ui/avatar';

@Component({
  imports: [FZ_HOVER_CARD, FZ_AVATAR],
  template: `
    <p class="text-sm">
      Built on
      <a href="https://angular.dev" class="font-medium underline underline-offset-4" [fzHoverCardTrigger]="card">&#64;angular/aria</a>
      and the CDK.
    </p>
    <div fzHoverCard #card="fzHoverCard" class="flex gap-4">
      <fz-avatar alt="Angular" fallback="A" />
      <div class="grid gap-1">
        <p class="font-semibold">&#64;angular/aria</p>
        <p class="text-muted-foreground">Accessible, unstyled behavior for Angular components.</p>
        <a href="https://angular.dev/guide/aria/overview" class="w-fit text-xs underline underline-offset-4">Read the guide</a>
      </div>
    </div>
  `,
})
export class Demo {}
