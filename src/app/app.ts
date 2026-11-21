import { Component, signal } from '@angular/core';
import { FZ_BUTTON } from '../../registry/ui/button';
import { FZ_TABS } from '../../registry/ui/tabs';
import { FZ_ACCORDION } from '../../registry/ui/accordion';
import { FZ_LISTBOX } from '../../registry/ui/listbox';
import { FZ_INPUT } from '../../registry/ui/input';
import { FZ_TEXTAREA } from '../../registry/ui/textarea';
import { FZ_LABEL } from '../../registry/ui/label';
import { FZ_CARD } from '../../registry/ui/card';
import { FZ_BADGE } from '../../registry/ui/badge';
import { FZ_SEPARATOR } from '../../registry/ui/separator';
import { FZ_SKELETON } from '../../registry/ui/skeleton';
import { FZ_AVATAR } from '../../registry/ui/avatar';
import { FZ_CONTEXT_MENU, FZ_MENU, FZ_MENUBAR } from '../../registry/ui/menu';
import { FZ_SELECT } from '../../registry/ui/select';
import { FZ_COMBOBOX } from '../../registry/ui/combobox';

@Component({
  selector: 'app-root',
  imports: [
    FZ_BUTTON, FZ_TABS, FZ_ACCORDION, FZ_LISTBOX,
    FZ_INPUT, FZ_TEXTAREA, FZ_LABEL, FZ_CARD, FZ_BADGE, FZ_SEPARATOR, FZ_SKELETON, FZ_AVATAR, FZ_MENU, FZ_MENUBAR, FZ_CONTEXT_MENU, FZ_SELECT, FZ_COMBOBOX,
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly tab = signal<string | undefined>('account');
  protected readonly action = signal<unknown>(undefined);
  protected readonly framework = signal<string | undefined>(undefined);
  protected readonly country = signal('');
  protected readonly countries = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'France', 'Germany', 'Iceland', 'Ireland', 'Italy', 'Japan', 'Norway', 'Portugal', 'Spain', 'Sweden'];
  protected readonly fruits = signal<string[]>(['apple']);
  protected toggleDark() {
    document.documentElement.classList.toggle('dark');
  }
}
