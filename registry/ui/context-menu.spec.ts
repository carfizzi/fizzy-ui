import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_CONTEXT_MENU } from './menu';

@Component({
  imports: [FZ_CONTEXT_MENU],
  template: `
    <div id="zone" [fzContextMenu]="ctx"><button>Inside</button></div>
    <button id="elsewhere">Elsewhere</button>
    <div fzMenu #ctx="fzMenu" (itemSelected)="picked.set($event)">
      <div fzMenuItem value="copy">Copy</div>
      <div fzMenuItem value="paste">Paste</div>
    </div>
  `,
})
class Host {
  picked = signal<unknown>(undefined);
}

const key = (k: string) =>
  (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const zone = el.querySelector<HTMLElement>("#zone")!;
  const inside = zone.querySelector('button')!;
  const menu = el.querySelector<HTMLElement>('[fzMenu]')!;
  const anchor = zone.querySelector<HTMLElement>('span')!;
  const items = [...menu.querySelectorAll<HTMLElement>('[fzMenuItem]')];
  const rightClick = async (x: number, y: number) => {
    const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y });
    inside.dispatchEvent(ev);
    await fixture.whenStable();
    return ev;
  };
  return { fixture, zone, inside, menu, anchor, items, rightClick, stable: () => fixture.whenStable() };
}

describe('FzContextMenu', () => {
  // See menu.spec.ts: jsdom has no popover API; the stubs make CDK place overlays inline, as browsers do.
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  beforeAll(() => ['showPopover', 'hidePopover', 'togglePopover'].forEach((m) => (proto[m] ??= () => {})));
  afterEach(() => (document.body.innerHTML = ''));

  it('keeps its content and stays closed on a normal click', async () => {
    const { zone, inside, menu, stable } = await setup();
    expect(zone.textContent).toContain('Inside');
    inside.click();
    await stable();
    expect(menu.getAttribute('data-visible')).toBe('false');
  });

  it('right click opens at the pointer instead of the browser menu and focuses the first item', async () => {
    const { menu, anchor, items, rightClick } = await setup();
    const ev = await rightClick(120, 80);
    expect(ev.defaultPrevented).toBe(true);
    expect(menu.getAttribute('data-visible')).toBe('true');
    expect(menu.closest('.cdk-overlay-pane')).not.toBeNull();
    expect([anchor.style.left, anchor.style.top]).toEqual(['120px', '76px']);
    expect(document.activeElement).toBe(items[0]);
  });

  it('a second right click moves it and keeps it open', async () => {
    const { menu, anchor, rightClick } = await setup();
    await rightClick(120, 80);
    await rightClick(300, 200);
    expect(menu.getAttribute('data-visible')).toBe('true');
    expect(anchor.style.left).toBe('300px');
  });

  it('Escape closes and gives focus back to where it was', async () => {
    const { inside, menu, rightClick, stable } = await setup();
    inside.focus();
    await rightClick(10, 10);
    key('Escape');
    await stable();
    expect(menu.getAttribute('data-visible')).toBe('false');
    expect(document.activeElement).toBe(inside);
  });

  it('Enter selects, closes and gives focus back', async () => {
    const { fixture, inside, menu, rightClick, stable } = await setup();
    inside.focus();
    await rightClick(10, 10);
    key('ArrowDown');
    await stable();
    key('Enter');
    await stable();
    expect(fixture.componentInstance.picked()).toBe('paste');
    expect(menu.getAttribute('data-visible')).toBe('false');
    expect(document.activeElement).toBe(inside);
  });

  it('does not steal focus back when the user moved it elsewhere', async () => {
    const { fixture, inside, menu, rightClick, stable } = await setup();
    inside.focus();
    await rightClick(10, 10);
    const elsewhere = fixture.nativeElement.querySelector('#elsewhere') as HTMLElement;
    elsewhere.focus();
    await stable();
    expect(menu.getAttribute('data-visible')).toBe('false');
    expect(document.activeElement).toBe(elsewhere);
  });
});
