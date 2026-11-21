import { Component, computed, signal } from '@angular/core';
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
import { FZ_MULTISELECT, FZ_SELECT } from '../../registry/ui/select';
import { FZ_COMBOBOX } from '../../registry/ui/combobox';
import { FZ_TOOLBAR } from '../../registry/ui/toolbar';
import { FZ_TREE, FzTreeNode } from '../../registry/ui/tree';
import { FZ_GRID } from '../../registry/ui/grid';

@Component({
  selector: 'app-root',
  imports: [
    FZ_BUTTON, FZ_TABS, FZ_ACCORDION, FZ_LISTBOX,
    FZ_INPUT, FZ_TEXTAREA, FZ_LABEL, FZ_CARD, FZ_BADGE, FZ_SEPARATOR, FZ_SKELETON, FZ_AVATAR, FZ_MENU, FZ_MENUBAR, FZ_CONTEXT_MENU, FZ_SELECT, FZ_MULTISELECT, FZ_COMBOBOX,
    FZ_TOOLBAR, FZ_TREE, FZ_GRID,
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly tab = signal<string | undefined>('account');
  protected readonly action = signal<unknown>(undefined);
  protected readonly framework = signal<string | undefined>(undefined);
  protected readonly country = signal('');
  protected readonly toppings = signal<string[]>(['cheese']);
  protected readonly countries = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'France', 'Germany', 'Iceland', 'Ireland', 'Italy', 'Japan', 'Norway', 'Portugal', 'Spain', 'Sweden'];
  protected readonly fruits = signal<string[]>(['apple']);
  protected readonly bold = signal(false);
  protected readonly italic = signal(false);
  protected readonly align = signal('left');
  protected readonly file = signal<string[]>([]);
  protected readonly files: FzTreeNode<string>[] = [
    {
      value: 'src',
      label: 'src',
      expanded: true,
      children: [
        { value: 'src/app', label: 'app', children: [{ value: 'src/app/app.ts', label: 'app.ts' }, { value: 'src/app/app.html', label: 'app.html' }] },
        { value: 'src/main.ts', label: 'main.ts' },
      ],
    },
    { value: 'registry', label: 'registry', children: [{ value: 'registry/registry.json', label: 'registry.json' }] },
    { value: 'secrets', label: 'secrets (locked)', disabled: true },
    { value: 'package.json', label: 'package.json' },
  ];
  protected readonly people = signal([
    { name: 'Ada', role: 'Engineer', city: 'London' },
    { name: 'Grace', role: 'Admiral', city: 'Arlington' },
    { name: 'Alan', role: 'Retired', city: 'Wilmslow' },
  ]);
  protected readonly cities = computed(() => this.people().map((p) => p.city).join(', '));
  protected setCity(name: string, city: string) {
    this.people.update((list) => list.map((p) => (p.name === name ? { ...p, city } : p)));
  }
  protected toggleDark() {
    document.documentElement.classList.toggle('dark');
  }
}
