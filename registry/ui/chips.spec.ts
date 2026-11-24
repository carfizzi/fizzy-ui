import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FZ_CHIPS } from './chips';

@Component({
  imports: [FZ_CHIPS],
  template: `
    <fz-chip-listbox multiple [(value)]="diet" aria-label="Diet" data-t="multi">
      <fz-chip value="veg" label="Vegetarian" />
      <fz-chip value="vegan" label="Vegan" />
      <fz-chip value="halal" label="Halal" disabled />
    </fz-chip-listbox>
    <fz-chip-listbox [(value)]="size" aria-label="Size" data-t="single">
      <fz-chip value="s" />
      <fz-chip value="m" />
    </fz-chip-listbox>
    <fz-chip-input [(value)]="tags" aria-label="Tags" />
  `,
})
class Host {
  diet = signal<string[]>([]);
  size = signal<string[]>(['s']);
  tags = signal<string[]>(['a']);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const chips = (t: string) => [...el.querySelectorAll<HTMLElement>(`[data-t=${t}] [role=option]`)];
  const input = el.querySelector<HTMLInputElement>('fz-chip-input input')!;
  const tags = () => [...el.querySelectorAll('fz-chip-input li')].map((li) => li.textContent!.trim());
  return { fixture, el, host: fixture.componentInstance, chips, input, tags, announce, stable: () => fixture.whenStable() };
}

describe('FzChipListbox', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('a horizontal listbox labelled from the host (label moved off it)', async () => {
    const { el, chips } = await setup();
    const host = el.querySelector<HTMLElement>('[data-t=multi]')!;
    const listbox = host.querySelector<HTMLElement>('[role=listbox]')!;
    expect(listbox.getAttribute('aria-label')).toBe('Diet');
    expect(listbox.getAttribute('aria-orientation')).toBe('horizontal');
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(chips('multi').map((c) => c.textContent!.trim())).toEqual(['Vegetarian', 'Vegan', 'Halal']);
    expect(chips('single').map((c) => c.textContent!.trim())).toEqual(['s', 'm']);
  });

  it('multiple: each click toggles its chip; a disabled chip never toggles', async () => {
    const { host, chips, stable } = await setup();
    chips('multi')[0].click();
    await stable();
    chips('multi')[1].click();
    await stable();
    expect(host.diet()).toEqual(['veg', 'vegan']);
    chips('multi')[0].click();
    await stable();
    expect(host.diet()).toEqual(['vegan']);
    chips('multi')[2].click();
    await stable();
    expect(host.diet()).toEqual(['vegan']);
    expect(chips('multi').map((c) => c.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  });

  it('single: a click picks one; arrows move focus without changing the value; Space picks', async () => {
    const { host, chips, stable } = await setup();
    chips('single')[1].click();
    await stable();
    expect(host.size()).toEqual(['m']);
    chips('single')[1].focus();
    key(chips('single')[1], 'ArrowLeft');
    await stable();
    expect(document.activeElement).toBe(chips('single')[0]);
    expect(host.size()).toEqual(['m']);
    key(chips('single')[0], ' ');
    await stable();
    expect(host.size()).toEqual(['s']);
  });
});

describe('FzChipInput', () => {
  afterEach(() => (document.body.innerHTML = ''));

  const type = (input: HTMLInputElement, text: string, k = 'Enter') => {
    input.value = text;
    key(input, k);
  };

  it('Enter or a comma adds a trimmed tag, once; empty and duplicates are ignored; it is announced', async () => {
    const { host, input, tags, announce, stable } = await setup();
    expect(input.getAttribute('aria-label')).toBe('Tags');
    type(input, '  b  ');
    await stable();
    type(input, 'c', ',');
    await stable();
    type(input, 'b');
    type(input, '   ');
    await stable();
    expect(host.tags()).toEqual(['a', 'b', 'c']);
    expect(tags()).toEqual(['a', 'b', 'c']);
    expect(input.value).toBe('');
    expect(announce).toHaveBeenCalledWith('Added b');
  });

  it('Backspace in the empty input removes the last tag; a remove button removes its tag and focuses the input', async () => {
    const { host, input, el, announce, stable } = await setup();
    type(input, 'b');
    await stable();
    input.value = 'x';
    key(input, 'Backspace'); // text left: nothing removed
    input.value = '';
    key(input, 'Backspace');
    await stable();
    expect(host.tags()).toEqual(['a']);
    expect(announce).toHaveBeenLastCalledWith('Removed b');

    const remove = el.querySelector<HTMLButtonElement>('fz-chip-input li button')!;
    expect(remove.getAttribute('aria-label')).toBe('Remove a');
    remove.focus();
    remove.click();
    await stable();
    expect(host.tags()).toEqual([]);
    expect(document.activeElement).toBe(input);
  });
});
