import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TOOLBAR } from './toolbar';

@Component({
  imports: [FZ_TOOLBAR],
  template: `
    <div fzToolbar aria-label="Formatting">
      <button fzToolbarItem data-t="bold" [(pressed)]="bold">B</button>
      <button fzToolbarItem data-t="italic" [(pressed)]="italic" [disabled]="true">I</button>
      <div fzToolbarGroup [(value)]="align" aria-label="Alignment">
        <button fzToolbarItem data-t="left" value="left">L</button>
        <button fzToolbarItem data-t="center" value="center">C</button>
        <button fzToolbarItem data-t="right" value="right">R</button>
      </div>
      <button fzToolbarItem data-t="print" (click)="printed = printed + 1">Print</button>
    </div>
  `,
})
class Host {
  bold = signal(false);
  italic = signal(false);
  align = signal('left');
  printed = 0;
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const item = (name: string) => el.querySelector<HTMLElement>(`[data-t=${name}]`)!;
  return { fixture, el, item, host: fixture.componentInstance, stable: () => fixture.whenStable() };
}

describe('FzToolbar', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('has toolbar, radiogroup, toggle and radio roles', async () => {
    const { el, item } = await setup();
    expect(el.querySelector('[fzToolbar]')!.getAttribute('role')).toBe('toolbar');
    expect(el.querySelector('[fzToolbarGroup]')!.getAttribute('role')).toBe('radiogroup');
    expect(item('bold').getAttribute('aria-pressed')).toBe('false');
    expect(item('bold').hasAttribute('role')).toBe(false);
    expect(item('left').getAttribute('role')).toBe('radio');
    expect(item('left').getAttribute('aria-checked')).toBe('true');
    expect(item('center').getAttribute('aria-checked')).toBe('false');
    // a plain action is neither a toggle nor a radio
    expect(item('print').hasAttribute('aria-pressed')).toBe(false);
    expect(item('print').hasAttribute('aria-checked')).toBe(false);
  });

  it('roving focus: one Tab stop, arrows (disabled included, soft) and Home/End', async () => {
    const { el, item, stable } = await setup();
    const tabbable = () => [...el.querySelectorAll<HTMLElement>('[fzToolbarItem]')].filter((b) => b.tabIndex === 0);
    expect(tabbable()).toEqual([item('bold')]);

    item('bold').focus();
    key(item('bold'), 'ArrowRight');
    await stable();
    expect(document.activeElement).toBe(item('italic'));
    expect(item('italic').getAttribute('aria-disabled')).toBe('true');
    key(item('italic'), 'ArrowRight');
    await stable();
    expect(document.activeElement).toBe(item('left'));
    key(item('left'), 'End');
    await stable();
    expect(document.activeElement).toBe(item('print'));
    key(item('print'), 'Home');
    await stable();
    expect(document.activeElement).toBe(item('bold'));
    expect(tabbable()).toEqual([item('bold')]);
    key(item('bold'), 'ArrowLeft');
    await stable();
    expect(document.activeElement).toBe(item('print')); // wraps by default
  });

  it('Up/Down move inside the group in a horizontal toolbar', async () => {
    const { item, stable } = await setup();
    item('left').focus();
    key(item('left'), 'ArrowDown');
    await stable();
    expect(document.activeElement).toBe(item('center'));
    key(item('center'), 'ArrowUp');
    await stable();
    expect(document.activeElement).toBe(item('left'));
  });

  it('toggles flip aria-pressed, the group keeps one value, actions just click', async () => {
    const { host, item, stable } = await setup();
    item('bold').click();
    await stable();
    expect(host.bold()).toBe(true);
    expect(item('bold').getAttribute('aria-pressed')).toBe('true');
    item('bold').click();
    await stable();
    expect(host.bold()).toBe(false);

    item('right').click();
    await stable();
    expect(host.align()).toBe('right');
    expect(item('right').getAttribute('aria-checked')).toBe('true');
    expect(item('left').getAttribute('aria-checked')).toBe('false');
    item('right').click();
    await stable();
    expect(host.align()).toBe('right'); // a radio does not uncheck itself

    item('print').click();
    expect(host.printed).toBe(1);
  });

  it('a disabled item does not toggle', async () => {
    const { host, item, stable } = await setup();
    item('italic').click();
    await stable();
    expect(host.italic()).toBe(false);
    expect(item('italic').getAttribute('aria-pressed')).toBe('false');
  });
});
