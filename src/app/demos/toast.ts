import { Component, inject } from '@angular/core';
import { FzToaster } from '../../../registry/ui/toast';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_BUTTON],
  template: `
    <div class="flex flex-wrap gap-2">
      <button fzButton variant="outline" (click)="saved()">Save</button>
      <button fzButton variant="outline" (click)="deleted()">Delete</button>
      <button fzButton variant="outline" (click)="failed()">Fail</button>
    </div>
  `,
})
export class Demo {
  private readonly toaster = inject(FzToaster);

  protected saved() {
    this.toaster.show('Changes saved');
  }

  protected deleted() {
    this.toaster.show('File deleted', {
      description: 'report.pdf was moved to the trash.',
      action: { label: 'Undo', run: () => this.toaster.show('File restored') },
    });
  }

  protected failed() {
    this.toaster.show('Upload failed', { description: 'Check your connection and try again.', variant: 'destructive' });
  }
}
