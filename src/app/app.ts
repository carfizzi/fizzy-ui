import { Component, signal } from '@angular/core';
import { FzButton } from '../../registry/ui/button';
import { FZ_TABS } from '../../registry/ui/tabs';
import { FZ_ACCORDION } from '../../registry/ui/accordion';
import { FZ_LISTBOX } from '../../registry/ui/listbox';

@Component({
  selector: 'app-root',
  imports: [FzButton, FZ_TABS, FZ_ACCORDION, FZ_LISTBOX],
  templateUrl: './app.html',
})
export class App {
  protected readonly tab = signal<string | undefined>('account');
  protected readonly fruits = signal<string[]>(['apple']);
  protected toggleDark() {
    document.documentElement.classList.toggle('dark');
  }
}
