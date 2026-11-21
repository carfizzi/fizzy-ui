import { Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FZ_BUTTON } from '../../registry/ui/button';
import { FZ_DIALOG, FzDialog } from '../../registry/ui/dialog';
import { DOCS } from './docs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, FZ_BUTTON, FZ_DIALOG],
  templateUrl: './app.html',
})
export class App {
  protected readonly docs = DOCS;
  protected readonly guides = [
    { path: '/introduction', title: 'Introduction' },
    { path: '/installation', title: 'Installation' },
    { path: '/theming', title: 'Theming' },
  ];
  protected readonly dark = signal(document.documentElement.classList.contains('dark'));

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
