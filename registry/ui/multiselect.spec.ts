import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_MULTISELECT } from './select';

@Component({
  imports: [FZ_MULTISELECT],
  template: `
    <fz-multiselect [(value)]="tags" placeholder="Pick tags" aria-label="Tags">
      <fz-select-item value="bug" label="Bug" />
      <fz-select-item value="docs" label="Docs" />
      <fz-select-item value="wontfix" label="Won't fix" disabled />
      <fz-select-item value="ui" label="UI" />
    </fz-multiselect>
  `,
})
class Host {
  tags = signal<string[]>([]);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const select = fixture.nativeElement.querySelector('fz-multiselect') as HTMLElement;
  const listbox = () => document.querySelector<HTMLElement>('[role=listbox]');
  const options = () => [...document.querySelectorAll<HTMLElement>('[role=option]')];
  const stable = () => fixture.whenStable();
  return { fixture, select, listbox, options, stable, value: () => fixture.componentInstance.tags() };
}

describe('FzMultiselect', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('is a closed combobox with the placeholder', async () => {
    const { select, listbox } = await setup();
    expect(select.getAttribute('role')).toBe('combobox');
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(select.textContent).toContain('Pick tags');
    expect(listbox()).toBeNull();
  });

  it('clicks toggle several values, keep the list open and show the labels', async () => {
    const { select, listbox, options, stable, value } = await setup();
    select.click();
    await stable();
    expect(listbox()!.getAttribute('aria-multiselectable')).toBe('true');

    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    options()[0].dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    options()[0].click();
    await stable();
    options()[3].click();
    await stable();
    expect(value()).toEqual(['bug', 'ui']);
    expect(select.getAttribute('aria-expanded')).toBe('true');
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(select.textContent).toContain('Bug, UI');

    options()[0].click();
    await stable();
    expect(value()).toEqual(['ui']);
  });

  it('keyboard: arrows move, Space and Enter toggle and keep it open, Escape closes, focus stays', async () => {
    const { select, options, stable, value } = await setup();
    select.focus();
    key(select, 'ArrowDown');
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('true');
    const activeIndex = () => options().findIndex((o) => o.id === select.getAttribute('aria-activedescendant'));
    const first = activeIndex();
    key(select, ' ');
    await stable();
    expect(value()).toHaveLength(1);
    key(select, 'ArrowDown');
    await stable();
    expect(activeIndex()).toBe(first + 1);
    key(select, 'Enter');
    await stable();
    expect(value()).toHaveLength(2);
    expect(select.getAttribute('aria-expanded')).toBe('true');

    key(select, 'Escape');
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(value()).toHaveLength(2);
    expect(document.activeElement).toBe(select);
  });

  it('reflects an outside value and ignores disabled options', async () => {
    const { fixture, select, options, stable, value } = await setup();
    fixture.componentInstance.tags.set(['docs']);
    await stable();
    expect(select.textContent).toContain('Docs');
    select.click();
    await stable();
    expect(options()[1].getAttribute('aria-selected')).toBe('true');
    options()[2].click();
    await stable();
    expect(value()).toEqual(['docs']);
  });
});
