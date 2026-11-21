import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_MENUBAR } from './menu';

@Component({
  imports: [FZ_MENUBAR],
  template: `
    <div fzMenubar (itemSelected)="picked.set($event)">
      <div fzMenuItem value="file" [submenu]="file.menu">File</div>
      <div fzMenuItem value="edit" [submenu]="edit.menu">Edit</div>
    </div>
    <div data-m="file" fzMenu #file="fzMenu">
      <div fzMenuItem value="new">New</div>
      <div fzMenuItem value="share" [submenu]="share.menu">Share</div>
    </div>
    <div data-m="share" fzMenu #share="fzMenu"><div fzMenuItem value="link">Link</div></div>
    <div data-m="edit" fzMenu #edit="fzMenu">
      <div fzMenuItem value="undo">Undo</div>
      <div fzMenuItem value="redo">Redo</div>
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
  const bar = el.querySelector<HTMLElement>('[fzMenubar]')!;
  const [fileItem, editItem] = [...bar.querySelectorAll<HTMLElement>(':scope > [fzMenuItem]')];
  // by data-m (Aria owns the id): open menus move in the DOM, so document order changes
  const [file, share, edit] = ["file", "share", "edit"].map((m) => el.querySelector<HTMLElement>(`[data-m=${m}]`)!);
  const items = (m: HTMLElement) => [...m.querySelectorAll<HTMLElement>(':scope > [fzMenuItem]')];
  return { fixture, bar, fileItem, editItem, file, share, edit, items, stable: () => fixture.whenStable() };
}

describe('FzMenubar', () => {
  // See menu.spec.ts: jsdom has no popover API; the stubs make CDK place overlays inline, as browsers do.
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  beforeAll(() => ['showPopover', 'hidePopover', 'togglePopover'].forEach((m) => (proto[m] ??= () => {})));
  afterEach(() => (document.body.innerHTML = ''));

  it('exposes menubar semantics, submenus placed inside the bar but hidden', async () => {
    const { bar, fileItem, file, edit } = await setup();
    expect(bar.getAttribute('role')).toBe('menubar');
    expect(fileItem.getAttribute('role')).toBe('menuitem');
    expect(fileItem.getAttribute('aria-haspopup')).toBe('true');
    expect(bar.contains(file)).toBe(true);
    expect(bar.contains(edit)).toBe(true);
    expect(file.getAttribute('data-visible')).toBe('false');
  });

  it('click opens a menu, ArrowDown opens and focuses its first item', async () => {
    const { fileItem, file, items, stable } = await setup();
    fileItem.click();
    await stable();
    expect(fileItem.getAttribute('aria-expanded')).toBe('true');
    expect(file.getAttribute('data-visible')).toBe('true');

    fileItem.click();
    await stable();
    expect(fileItem.getAttribute('aria-expanded')).toBe('false');

    fileItem.focus();
    key('ArrowDown');
    await stable();
    expect(fileItem.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(items(file)[0]);
  });

  it('ArrowRight moves along the bar, also from inside an open menu', async () => {
    const { fileItem, editItem, edit, stable } = await setup();
    fileItem.focus();
    key('ArrowRight');
    await stable();
    expect(document.activeElement).toBe(editItem);

    key('ArrowLeft');
    await stable();
    key('ArrowDown');
    await stable();
    key('ArrowRight');
    await stable();
    expect(editItem.getAttribute('aria-expanded')).toBe('true');
    expect(edit.getAttribute('data-visible')).toBe('true');
    expect(fileItem.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes and returns focus to the bar item', async () => {
    const { fileItem, stable } = await setup();
    fileItem.focus();
    key('ArrowDown');
    await stable();
    key('Escape');
    await stable();
    expect(fileItem.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(fileItem);
  });

  it('Enter selects, nested submenus included, and the bar emits it', async () => {
    const { fixture, fileItem, file, share, items, stable } = await setup();
    fileItem.focus();
    key('ArrowDown');
    await stable();
    key('ArrowDown');
    await stable();
    key('ArrowRight');
    await stable();
    expect(file.contains(share)).toBe(true);
    expect(document.activeElement).toBe(items(share)[0]);
    key('Enter');
    await stable();
    expect(fixture.componentInstance.picked()).toBe('link');
    expect(fileItem.getAttribute('aria-expanded')).toBe('false');
  });
});
