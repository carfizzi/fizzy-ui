import { Component } from '@angular/core';
import { FZ_DIALOG } from '../../../registry/ui/dialog';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON],
  template: `
    <button fzButton variant="outline" (click)="dlg.open()">Delete account</button>
    <ng-template fzDialog role="alertdialog" #dlg="fzDialog">
      <h2 fzDialogTitle>Delete your account?</h2>
      <p fzDialogDescription>This cannot be undone. Your projects and settings will be removed.</p>
      <div class="flex justify-end gap-2">
        <button fzButton variant="outline" fzDialogClose cdkFocusInitial>Cancel</button>
        <button fzButton variant="destructive" [fzDialogClose]="true">Delete</button>
      </div>
    </ng-template>
  `,
})
export class Demo {}
