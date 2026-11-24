import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_COMMAND } from './command';

@Component({
  imports: [FZ_COMMAND],
  template: `
    <fz-command (itemSelected)="ran.set($any($event))">
      <fz-command-group heading="Pages">
        <fz-command-item value="home" label="Home" />
        <fz-command-item value="settings" label="Settings" [keywords]="['preferences']" shortcut="⌘S" />
      </fz-command-group>
      <fz-command-group heading="Actions">
        <fz-command-item value="logout" label="Log out" />
        <fz-command-item value="delete" label="Delete" disabled />
      </fz-command-group>
    </fz-command>
  `,
})
class Host {
  ran = signal<string | undefined>(undefined);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const input = el.querySelector('input')!;
  const options = () => [...el.querySelectorAll<HTMLElement>('[role=option]')];
  const labels = () => options().map((o) => o.textContent!.trim());
  const active = () => options().find((o) => o.id === input.getAttribute('aria-activedescendant'));
  const stable = () => fixture.whenStable();
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await stable();
  };
  return { fixture, el, input, options, labels, active, stable, type, ran: () => fixture.componentInstance.ran() };
}

describe('FzCommand', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('an always-expanded combobox over a listbox of named groups', async () => {
    const { el, input, labels } = await setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-label')).toBe('Search');
    const listbox = el.querySelector('[role=listbox]')!;
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    const groups = [...el.querySelectorAll('[role=group]')].map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent);
    expect(groups).toEqual(['Pages', 'Actions']);
    expect(labels()).toEqual(['Home', 'Settings ⌘S', 'Log out', 'Delete']);
  });

  it('typing filters by label and keywords (empty groups go) and highlights the first match; Enter runs it', async () => {
    const { el, input, labels, active, stable, type, ran } = await setup();
    input.focus();
    await type('PREF');
    expect(labels()).toEqual(['Settings ⌘S']);
    expect(el.querySelectorAll('[role=group]').length).toBe(1);
    expect(active()?.textContent).toContain('Settings');
    key(input, 'Enter');
    await stable();
    expect(ran()).toBe('settings');
  });

  it('arrows move the highlight; a click runs an item; a disabled one never runs', async () => {
    const { input, options, active, stable, type, ran } = await setup();
    input.focus();
    await type('o'); // Home, Log out
    key(input, 'ArrowDown');
    await stable();
    expect(active()?.textContent).toContain('Log out');
    options()[0].click();
    await stable();
    expect(ran()).toBe('home');

    await type('del');
    options()[0].click();
    await stable();
    expect(ran()).toBe('home');
  });

  it('no match: an empty message, announced', async () => {
    const { el, type, options } = await setup();
    await type('zzz');
    expect(options()).toHaveLength(0);
    expect(el.textContent).toContain('No results.');
    expect(el.querySelector('[aria-live=polite]')!.textContent).toBe('No results');
  });

  it('label matches come before keyword matches; Escape is passed on to whatever is around it', async () => {
    const { el, input, labels, type } = await setup();
    await type('s');
    expect(labels()[0]).toBe('Settings ⌘S');
    await type('pref');
    expect(labels()).toEqual(['Settings ⌘S']);

    const seen: KeyboardEvent[] = [];
    el.addEventListener('keydown', (e) => seen.push(e));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const forwarded = seen.find((e) => e.target === el.querySelector('fz-command'));
    expect(forwarded?.key).toBe('Escape');
    expect(forwarded?.keyCode).toBe(27);
  });
});
