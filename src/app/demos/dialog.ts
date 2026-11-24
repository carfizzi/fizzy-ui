import { Component } from '@angular/core';
import { FZ_DIALOG } from '../../../registry/ui/dialog';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_INPUT } from '../../../registry/ui/input';
import { FZ_LABEL } from '../../../registry/ui/label';

@Component({
  imports: [FZ_DIALOG, FZ_BUTTON, FZ_INPUT, FZ_LABEL],
  template: `
    <button fzButton variant="outline" (click)="dlg.open()">Edit profile</button>
    <ng-template fzDialog #dlg="fzDialog">
      <h2 fzDialogTitle>Edit profile</h2>
      <p fzDialogDescription>Make changes to your profile here.</p>
      <label fzLabel for="dlg-name">Name</label>
      <input fzInput id="dlg-name" value="Ada Lovelace" />
      <div class="flex justify-end gap-2">
        <button fzButton variant="outline" fzDialogClose>Cancel</button>
        <button fzButton fzDialogClose>Save</button>
      </div>
    </ng-template>
  `,
})
export class Demo {}
