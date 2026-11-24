import { Component, signal } from '@angular/core';
import { FZ_SIDEBAR } from '../../../registry/ui/sidebar';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [FZ_SIDEBAR, FZ_BUTTON],
  template: `
    <div fzSidebarLayout class="h-80 overflow-hidden rounded-lg border">
      <fz-sidebar aria-label="Project">
        <p class="px-2 pt-1 font-semibold">Acme</p>
        <nav aria-label="Project pages" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <h2 fzSidebarGroupLabel>Workspace</h2>
            @for (p of pages; track p) {
              <button fzSidebarItem [attr.aria-current]="p === page() ? 'page' : null" (click)="page.set(p)">{{ p }}</button>
            }
          </div>
        </nav>
      </fz-sidebar>
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-center gap-2 border-b p-2">
          <button fzButton fzSidebarTrigger variant="ghost" size="sm" icon aria-label="Toggle sidebar">
            <svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M6 3v10" /></svg>
          </button>
          <span class="text-sm font-medium">{{ page() }}</span>
        </div>
        <p class="p-4 text-sm text-muted-foreground">The {{ page().toLowerCase() }} page.</p>
      </div>
    </div>
  `,
})
export class Demo {
  protected readonly pages = ['Dashboard', 'Projects', 'Team', 'Settings'];
  protected readonly page = signal('Dashboard');
}
