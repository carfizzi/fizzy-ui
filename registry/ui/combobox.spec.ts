import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_COMBOBOX } from './combobox';

@Component({
  imports: [FZ_COMBOBOX],
  template: `
    <label for="country">Country</label>
    <input id="country" fzCombobox [options]="countries" [(value)]="country" placeholder="Search" />
  `,
})
class Host {
  countries = ['Italy', 'Ireland', 'Iceland', 'Spain', 'France'];
  country = signal('');
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const options = () => [...document.querySelectorAll<HTMLElement>('[role=option]')];
  const stable = () => fixture.whenStable();
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await stable();
  };
  return { fixture, input, options, stable, type, value: () => fixture.componentInstance.country() };
}

describe('FzCombobox', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('is a labelled, closed combobox on the native input', async () => {
    const { input } = await setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.labels![0].textContent).toBe('Country');
    expect(input.placeholder).toBe('Search');
  });

  it('typing opens and filters, case-insensitive, and updates the bound value', async () => {
    const { input, options, type, value } = await setup();
    input.focus();
    await type('LAN');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.textContent!.trim())).toEqual(['Ireland', 'Iceland']);
    expect(value()).toBe('LAN');
  });

  it('arrows move aria-activedescendant, Enter writes the option into the input and closes', async () => {
    const { input, options, type, stable, value } = await setup();
    input.focus();
    await type('i');
    key(input, 'ArrowDown');
    await stable();
    const active = options().find((o) => o.id === input.getAttribute('aria-activedescendant'));
    expect(active).toBeDefined();
    key(input, 'Enter');
    await stable();
    expect(value()).toBe(active!.textContent!.trim());
    expect(input.value).toBe(value());
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(input);
  });

  it('click on an option picks it without moving focus', async () => {
    const { input, options, type, stable, value } = await setup();
    input.focus();
    await type('sp');
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    options()[0].dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    options()[0].click();
    await stable();
    expect(value()).toBe('Spain');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('no match shows "No results" and announces it', async () => {
    const { input, options, type } = await setup();
    input.focus();
    await type('zzz');
    expect(options()).toEqual([]);
    expect(document.body.textContent).toContain('No results');
    expect(document.querySelector('[aria-live=polite]')!.textContent).toBe('No results');
  });

  it('click opens with every option, Escape closes', async () => {
    const { input, options, stable } = await setup();
    input.focus();
    input.click();
    await stable();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(options()).toHaveLength(5);
    key(input, 'Escape');
    await stable();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
});
