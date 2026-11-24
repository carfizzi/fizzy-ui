import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_SIDEBAR } from './sidebar';

@Component({
  imports: [FZ_SIDEBAR],
  template: `
    <div fzSidebarLayout [(open)]="open">
      <fz-sidebar aria-label="Project">
        <a fzSidebarItem href="#" aria-current="page" (click)="$event.preventDefault()">Dashboard</a>
        <button fzSidebarItem>Team</button>
      </fz-sidebar>
      <main><button fzSidebarTrigger aria-label="Toggle sidebar">≡</button><button data-t="main">Main action</button></main>
    </div>
    <footer><button data-t="footer">Footer</button></footer>
  `,
})
class Host {
  open = signal(true);
}

// jsdom has no matchMedia: pretend the viewport is (or isn't) below md.
function viewport(mobile: boolean) {
  window.matchMedia = ((q: string) => ({ matches: mobile, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
}

async function setup(mobile: boolean) {
  viewport(mobile);
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const sidebar = el.querySelector<HTMLElement>('fz-sidebar')!;
  const trigger = el.querySelector<HTMLButtonElement>('[fzSidebarTrigger]')!;
  const q = (t: string) => el.querySelector<HTMLElement>(`[data-t=${t}]`)!;
  return { fixture, el, sidebar, trigger, q, host: fixture.componentInstance, stable: () => fixture.whenStable() };
}

describe('FzSidebar', () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
    document.body.innerHTML = '';
  });

  it('wide screens: a column the trigger collapses (inert) and expands, bound to [(open)]', async () => {
    const { sidebar, trigger, host, stable } = await setup(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(sidebar.id);
    expect(sidebar.getAttribute('role')).toBeNull();
    expect(sidebar.hasAttribute('aria-label')).toBe(false); // no name on an element with no role
    expect(sidebar.getAttribute('data-state')).toBe('open');

    trigger.click();
    await stable();
    expect(host.open()).toBe(false);
    expect(sidebar.getAttribute('data-state')).toBe('closed');
    expect(sidebar.inert).toBe(true);
    host.open.set(true);
    await stable();
    expect(sidebar.inert).toBe(false);
  });

  it('phones: a drawer; open, it is a named modal dialog with the rest of the page inert and focus inside', async () => {
    const { el, sidebar, trigger, stable } = await setup(true);
    expect(sidebar.getAttribute('data-state')).toBe('closed');
    expect(sidebar.inert).toBe(true);
    trigger.focus();
    trigger.click();
    await stable();
    expect(sidebar.getAttribute('role')).toBe('dialog');
    expect(sidebar.getAttribute('aria-modal')).toBe('true');
    expect(sidebar.getAttribute('aria-label')).toBe('Project');
    expect(el.querySelector('main')!.inert).toBe(true);
    expect(el.querySelector('footer')!.inert).toBe(true); // outside the layout too
    expect(sidebar.inert).toBe(false);
    expect(sidebar.contains(document.activeElement)).toBe(true);

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();
    expect(sidebar.getAttribute('data-state')).toBe('closed');
    expect(el.querySelector('main')!.inert).toBe(false);
    expect(el.querySelector('footer')!.inert).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('phones: the backdrop and following a link close the drawer', async () => {
    const { el, sidebar, trigger, stable } = await setup(true);
    trigger.click();
    await stable();
    const backdrop = el.querySelector<HTMLElement>('[fzSidebarLayout] > div.fixed')!;
    expect(backdrop.dataset['open']).toBe('true');
    backdrop.click();
    await stable();
    expect(sidebar.getAttribute('data-state')).toBe('closed');

    trigger.click();
    await stable();
    sidebar.querySelector<HTMLElement>('a')!.click();
    await stable();
    expect(sidebar.getAttribute('data-state')).toBe('closed');
  });
});
