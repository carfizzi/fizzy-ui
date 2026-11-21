import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_LISTBOX } from './listbox';

@Component({
  imports: [FZ_LISTBOX],
  template: `
    <ul fzListbox [multi]="multi()" [selectionMode]="mode() ?? (multi() ? 'explicit' : 'follow')" [(value)]="value" aria-label="Fruits">
      @for (f of fruits; track f) {
        <li fzOption [value]="f" [label]="f" [disabled]="f === 'durian'">{{ f }}</li>
      }
    </ul>
  `,
})
class Host {
  fruits = ['apple', 'banana', 'cherry', 'durian'];
  multi = signal(false);
  mode = signal<'follow' | 'explicit' | undefined>(undefined);
  value = signal<string[]>([]);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup(multi = false) {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.multi.set(multi);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const listbox = el.querySelector<HTMLElement>('[fzListbox]')!;
  const options = [...el.querySelectorAll<HTMLElement>('[fzOption]')];
  const active = () => options.findIndex((o) => o.getAttribute('data-active') === 'true');
  return { fixture, listbox, options, active, value: () => fixture.componentInstance.value() };
}

describe('FzListbox', () => {
  it('single: click replaces the value', async () => {
    const { fixture, options, value } = await setup();
    options[0].click();
    await fixture.whenStable();
    options[1].click();
    await fixture.whenStable();
    expect(value()).toEqual(['banana']);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('multi (explicit): click toggles values', async () => {
    const { fixture, options, value } = await setup(true);
    options[0].click();
    await fixture.whenStable();
    options[2].click();
    await fixture.whenStable();
    expect(value()).toEqual(['apple', 'cherry']);

    options[0].click();
    await fixture.whenStable();
    expect(value()).toEqual(['cherry']);
  });

  it('keyboard: arrows move the active option, Space selects in multi', async () => {
    const { fixture, listbox, active, value } = await setup(true);
    listbox.focus();
    key(listbox, 'ArrowDown');
    await fixture.whenStable();
    const first = active();
    key(listbox, 'ArrowDown');
    await fixture.whenStable();
    expect(active()).toBe(first + 1);

    key(listbox, ' ');
    await fixture.whenStable();
    expect(value()).toContain(['apple', 'banana', 'cherry'][active()]);
  });

  it('multi (follow): click replaces, Ctrl+click adds', async () => {
    const { fixture, options, value } = await setup(true);
    fixture.componentInstance.mode.set('follow');
    await fixture.whenStable();
    options[0].click();
    await fixture.whenStable();
    options[1].click();
    await fixture.whenStable();
    expect(value()).toEqual(['banana']);

    options[2].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await fixture.whenStable();
    expect(value()).toEqual(['banana', 'cherry']);
  });

  it('Home and End jump to the first and last option', async () => {
    const { fixture, listbox, active, options, value } = await setup();
    listbox.focus();
    key(listbox, 'End');
    await fixture.whenStable();
    // softDisabled (Aria default): the disabled last option is focusable but not selected.
    expect(active()).toBe(3);
    expect(options[3].getAttribute('aria-selected')).not.toBe('true');
    expect(value()).not.toContain('durian');

    key(listbox, 'Home');
    await fixture.whenStable();
    expect(active()).toBe(0);
    expect(value()).toEqual(['apple']);
  });

  it('typeahead moves to the matching option', async () => {
    const { fixture, listbox, active } = await setup();
    listbox.focus();
    key(listbox, 'c');
    await fixture.whenStable();
    expect(active()).toBe(2);
  });

  it('disabled option cannot be selected', async () => {
    const { fixture, options, value } = await setup(true);
    expect(options[3].getAttribute('aria-disabled')).toBe('true');
    options[3].click();
    await fixture.whenStable();
    expect(value()).toEqual([]);
  });
});
