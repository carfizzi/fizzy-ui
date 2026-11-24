import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TOGGLE, FZ_TOGGLE_GROUP } from './toggle';

@Component({
  imports: [FZ_TOGGLE, FZ_TOGGLE_GROUP],
  template: `
    <button fzToggle [(pressed)]="bold" aria-label="Bold">B</button>
    <button fzToggle disabled aria-label="Off">U</button>
    <div fzToggleGroup [(value)]="align" aria-label="Alignment" data-t="single">
      <button fzToggleGroupItem value="left">Left</button>
      <button fzToggleGroupItem value="center">Center</button>
      <button fzToggleGroupItem value="right" [disabled]="true">Right</button>
    </div>
    <div fzToggleGroup multiple [(value)]="style" aria-label="Style" data-t="multi">
      <button fzToggleGroupItem value="b">B</button>
      <button fzToggleGroupItem value="i">I</button>
    </div>
  `,
})
class Host {
  bold = signal(false);
  align = signal<string | undefined>('left');
  style = signal<string[]>([]);
}

const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const items = (t: string) => [...el.querySelectorAll<HTMLElement>(`[data-t=${t}] button`)];
  const pressed = (t: string) => items(t).map((b) => b.getAttribute('aria-pressed'));
  return { fixture, el, host: fixture.componentInstance, items, pressed, stable: () => fixture.whenStable() };
}

describe('FzToggle', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('a native button with aria-pressed that flips on click and binds [(pressed)]', async () => {
    const { el, host, stable } = await setup();
    const [bold, off] = el.querySelectorAll<HTMLButtonElement>('button[fzToggle]');
    expect(bold.type).toBe('button');
    expect(bold.getAttribute('aria-pressed')).toBe('false');
    bold.click();
    await stable();
    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(host.bold()).toBe(true);
    host.bold.set(false);
    await stable();
    expect(bold.getAttribute('aria-pressed')).toBe('false');

    off.click();
    await stable();
    expect(off.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('FzToggleGroup', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('single: a click presses one item, again clears it; a disabled item never presses', async () => {
    const { host, items, pressed, stable } = await setup();
    expect(pressed('single')).toEqual(['true', 'false', 'false']);
    items('single')[1].click();
    await stable();
    expect(host.align()).toBe('center');
    expect(pressed('single')).toEqual(['false', 'true', 'false']);
    items('single')[1].click();
    await stable();
    expect(host.align()).toBeUndefined();
    items('single')[2].click();
    await stable();
    expect(host.align()).toBeUndefined();
  });

  it('multiple: each item adds or removes its value', async () => {
    const { host, items, pressed, stable } = await setup();
    items('multi')[1].click();
    await stable();
    items('multi')[0].click();
    await stable();
    expect(host.style()).toEqual(['i', 'b']);
    expect(pressed('multi')).toEqual(['true', 'true']);
    items('multi')[1].click();
    await stable();
    expect(host.style()).toEqual(['b']);
  });

  it('a toolbar with one Tab stop: arrows and Home/End move focus, not the value', async () => {
    const { el, host, items, stable } = await setup();
    const group = el.querySelector<HTMLElement>('[data-t=single]')!;
    expect(group.getAttribute('role')).toBe('toolbar');
    expect(items('single').map((b) => b.tabIndex)).toEqual([0, -1, -1]);

    items('single')[0].focus();
    key(items('single')[0], 'ArrowRight');
    await stable();
    expect(document.activeElement).toBe(items('single')[1]);
    key(items('single')[1], 'End');
    await stable();
    expect(document.activeElement).toBe(items('single')[2]); // soft-disabled: focusable
    key(items('single')[2], 'Home');
    await stable();
    expect(document.activeElement).toBe(items('single')[0]);
    expect(host.align()).toBe('left');
  });
});
