import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_NAVIGATION_MENU } from './navigation-menu';

@Component({
  imports: [FZ_NAVIGATION_MENU],
  template: `
    <nav fzNavigationMenu aria-label="Main">
      <ul>
        <li fzNavigationMenuItem data-t="a">
          <button fzNavigationMenuTrigger>Docs</button>
          <div fzNavigationMenuContent><a href="/intro">Intro</a></div>
        </li>
        <li fzNavigationMenuItem data-t="b">
          <button fzNavigationMenuTrigger>Components</button>
          <div fzNavigationMenuContent><a href="/dialog">Dialog</a></div>
        </li>
        <li><a fzNavigationMenuLink href="/theming" aria-current="page">Theming</a></li>
      </ul>
    </nav>
    <button data-t="outside">Elsewhere</button>
  `,
})
class Host {}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const trigger = (t: string) => el.querySelector<HTMLButtonElement>(`[data-t=${t}] button`)!;
  const panel = (t: string) => el.querySelector<HTMLElement>(`[data-t=${t}] [fzNavigationMenuContent]`)!;
  const isOpen = (t: string) => panel(t).getAttribute('data-open') === 'true';
  return { fixture, el, trigger, panel, isOpen, stable: () => fixture.whenStable() };
}

describe('FzNavigationMenu', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('disclosure buttons wired to their panels; a click opens one panel at a time and toggles it', async () => {
    const { trigger, panel, isOpen, stable } = await setup();
    expect(trigger('a').getAttribute('aria-expanded')).toBe('false');
    expect(trigger('a').getAttribute('aria-controls')).toBe(panel('a').id);
    expect(trigger('a').type).toBe('button');
    expect(panel('a').querySelector('a')).not.toBeNull(); // links stay links: no menu roles
    expect(panel('a').getAttribute('role')).toBeNull();

    trigger('a').click();
    await stable();
    expect(isOpen('a')).toBe(true);
    expect(trigger('a').getAttribute('aria-expanded')).toBe('true');
    trigger('b').click();
    await stable();
    expect([isOpen('a'), isOpen('b')]).toEqual([false, true]);
    trigger('b').click();
    await stable();
    expect(isOpen('b')).toBe(false);
  });

  it('Escape closes and returns focus to the button; focus leaving the nav closes; a click outside closes', async () => {
    const { el, trigger, panel, isOpen, stable } = await setup();
    trigger('a').click();
    await stable();
    const link = panel('a').querySelector('a')!;
    link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();
    expect(isOpen('a')).toBe(false);
    expect(document.activeElement).toBe(trigger('a'));

    trigger('a').click();
    await stable();
    el.querySelector<HTMLElement>('[data-t=outside]')!.focus();
    await stable();
    expect(isOpen('a')).toBe(false);

    trigger('a').click();
    await stable();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await stable();
    expect(isOpen('a')).toBe(false);
  });

  it('hover opens after a short delay, moves between items at once, closes after leaving; a click right after keeps it open', async () => {
    const { el, trigger, isOpen } = await setup();
    vi.useFakeTimers(); // after the first render
    const item = (t: string) => el.querySelector(`[data-t=${t}]`)!;
    const tick = (ms: number) => (vi.advanceTimersByTime(ms), TestBed.tick());
    item('a').dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    tick(100);
    expect(isOpen('a')).toBe(false);
    tick(50);
    expect(isOpen('a')).toBe(true);
    trigger('a').click(); // just opened by hover: stays open
    TestBed.tick();
    expect(isOpen('a')).toBe(true);

    item('a').dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    item('b').dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    tick(0);
    expect([isOpen('a'), isOpen('b')]).toEqual([false, true]);
    item('b').dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    tick(300);
    expect(isOpen('b')).toBe(false);
  });

  it('a top-level link is styled from aria-current', async () => {
    const { el } = await setup();
    expect(el.querySelector('[fzNavigationMenuLink]')!.classList).toContain('aria-[current=page]:bg-accent');
  });
});
