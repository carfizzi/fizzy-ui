import { Component, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FZ_BUTTON } from '../../registry/ui/button';
import { FZ_DIALOG, FzDialog } from '../../registry/ui/dialog';
import { FZ_COMMAND } from '../../registry/ui/command';
import { FZ_KBD } from '../../registry/ui/kbd';
import { DialogRef } from '@angular/cdk/dialog';
import { DOCS } from './docs';
import { Logo } from './logo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, FZ_BUTTON, FZ_DIALOG, FZ_COMMAND, FZ_KBD, Logo],
  templateUrl: './app.html',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class App {
  protected readonly docs = DOCS;
  protected readonly guides = [
    { path: '/introduction', title: 'Introduction' },
    { path: '/installation', title: 'Installation' },
    { path: '/theming', title: 'Theming' },
  ];
  protected readonly dark = signal(document.documentElement.classList.contains('dark'));
  private readonly router = inject(Router);
  private readonly search = viewChild.required('search', { read: FzDialog });
  private searchRef?: DialogRef;

  // ⌘K / Ctrl+K opens the search from anywhere.
  protected onKeydown(event: KeyboardEvent) {
    if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
    event.preventDefault();
    this.openSearch();
  }

  protected openSearch() {
    if (this.searchRef) return; // already open
    const ref = (this.searchRef = this.search().open());
    ref.closed.subscribe(() => (this.searchRef = undefined));
  }

  protected go(path: string) {
    void this.router.navigateByUrl(path);
    this.searchRef?.close();
  }

  protected closeOnLink(event: Event, nav: FzDialog) {
    if ((event.target as Element).closest('a')) nav.close();
  }

  protected toggleDark() {
    const dark = document.documentElement.classList.toggle('dark');
    this.dark.set(dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {} // storage blocked: the choice just lasts for this visit
  }
}
