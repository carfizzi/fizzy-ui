import { Component } from '@angular/core';
import { FZ_DIALOG } from '../../../registry/ui/dialog';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_SWITCH } from '../../../registry/ui/switch';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON, FZ_SWITCH],
  template: `
    <button fzButton variant="outline" (click)="sheet.open()">Open settings</button>
    <ng-template fzDialog side="right" #sheet="fzDialog">
      <h2 fzDialogTitle>Settings</h2>
      <p class="text-sm text-muted-foreground">A sheet is a dialog docked to an edge: side is left, right, top or bottom.</p>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" fzSwitch /> Notifications</label>
      <button fzButton variant="outline" fzDialogClose class="mt-auto">Close</button>
    </ng-template>
  `,
})
export class Demo {}
