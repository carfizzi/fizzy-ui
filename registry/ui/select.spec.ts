import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_SELECT } from './select';

@Component({
  imports: [FZ_SELECT],
  template: `
    <fz-select [(value)]="fruit" placeholder="Pick a fruit" aria-label="Fruit" [disabled]="disabled()">
      <fz-select-item value="apple" label="Apple" />
      <fz-select-item value="banana" label="Banana" />
      <fz-select-item value="durian" label="Durian" disabled />
      <fz-select-item value="kiwi" />
    </fz-select>
  `,
})
class Host {
  fruit = signal<string | undefined>(undefined);
  disabled = signal(false);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

// jsdom has no Web Animations: pretend an element marked data-closing runs an exit animation until finish().
function fakeExitAnimation() {
  let finish!: () => void;
  const finished = new Promise<void>((r) => (finish = r));
  const proto = HTMLElement.prototype as unknown as { getAnimations?: () => unknown[] };
  const original = proto.getAnimations;
  proto.getAnimations = function (this: HTMLElement) {
    return this.hasAttribute('data-closing') ? [{ finished }] : [];
  };
  return { finish: async () => (finish(), await finished), restore: () => (proto.getAnimations = original) };
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const select = fixture.nativeElement.querySelector('fz-select') as HTMLElement;
  const listbox = () => document.querySelector<HTMLElement>('[role=listbox]');
  const options = () => [...document.querySelectorAll<HTMLElement>('[role=option]')];
  const stable = () => fixture.whenStable();
  return { fixture, select, listbox, options, stable, value: () => fixture.componentInstance.fruit() };
}

describe('FzSelect', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('is a closed combobox showing the placeholder', async () => {
    const { select, listbox } = await setup();
    expect(select.getAttribute('role')).toBe('combobox');
    expect(select.getAttribute('aria-label')).toBe('Fruit');
    // aria-haspopup comes from the popup, rendered on open; role=combobox implies listbox anyway.
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(select.tabIndex).toBe(0);
    expect(select.textContent).toContain('Pick a fruit');
    expect(listbox()).toBeNull();
  });

  it('click opens the options and picking one sets the value, shows its label and closes', async () => {
    const { select, listbox, options, stable, value } = await setup();
    select.click();
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('true');
    expect(select.getAttribute('aria-controls')).toBe(listbox()!.id);
    expect(select.getAttribute('aria-haspopup')).toBe('listbox');
    expect(options().map((o) => o.textContent!.trim())).toEqual(['Apple', 'Banana', 'Durian', 'kiwi']);

    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    options()[1].dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true); // keeps focus on the select
    options()[1].click();
    await stable();
    expect(value()).toBe('banana');
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(select.textContent).toContain('Banana');
    expect(select.textContent).not.toContain('Pick a fruit');
  });

  it('keyboard: arrows move aria-activedescendant, Enter picks, focus stays on the select', async () => {
    const { select, options, stable, value } = await setup();
    select.focus();
    key(select, 'ArrowDown');
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('true');
    key(select, 'ArrowDown');
    await stable();
    const active = select.getAttribute('aria-activedescendant');
    expect(active).toBe(options().find((o) => o.getAttribute('data-active') === 'true')!.id);

    key(select, 'Enter');
    await stable();
    expect(value()).not.toBeUndefined();
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(select);
  });

  it('Escape closes without changing the value', async () => {
    const { fixture, select, stable, value } = await setup();
    fixture.componentInstance.fruit.set('apple');
    await stable();
    select.focus();
    key(select, 'ArrowDown');
    await stable();
    key(select, 'ArrowDown');
    await stable();
    key(select, 'Escape');
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(value()).toBe('apple');
  });

  it('clicking the selected option keeps it selected', async () => {
    const { fixture, select, options, stable, value } = await setup();
    fixture.componentInstance.fruit.set('apple');
    await stable();
    select.click();
    await stable();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    options()[0].click();
    await stable();
    expect(value()).toBe('apple');
    select.click();
    await stable();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('a disabled option cannot be picked, a disabled select does not open', async () => {
    const { fixture, select, options, stable, value } = await setup();
    select.click();
    await stable();
    expect(options()[2].getAttribute('aria-disabled')).toBe('true');
    options()[2].click();
    await stable();
    expect(value()).toBeUndefined();
    expect(select.getAttribute('aria-expanded')).toBe('true');
    select.click();
    await stable();

    fixture.componentInstance.disabled.set(true);
    await stable();
    expect(select.getAttribute('aria-disabled')).toBe('true');
    select.click();
    await stable();
    expect(select.getAttribute('aria-expanded')).toBe('false');
  });

  it('the list fades out before it goes: still there, inert, until the exit animation ends', async () => {
    const anim = fakeExitAnimation();
    try {
      const { select, listbox, options, stable, value } = await setup();
      select.click();
      await stable();
      options()[1].click();
      await stable();
      expect(value()).toBe('banana');
      expect(select.getAttribute('aria-expanded')).toBe('false');
      expect(listbox()!.hasAttribute('data-closing')).toBe(true);
      expect(listbox()!.inert).toBe(true);
      await anim.finish();
      await stable();
      expect(listbox()).toBeNull();
    } finally {
      anim.restore();
    }
  });
});
