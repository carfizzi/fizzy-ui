import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzScrollArea } from './scroll-area';

@Component({
  imports: [FzScrollArea],
  template: `<fz-scroll-area class="h-40" [aria-label]="label()"><p>Long content</p></fz-scroll-area>`,
})
class Host {
  readonly label = signal<string | undefined>('Tags');
}

@Component({
  imports: [FzScrollArea],
  template: `<div dir="rtl"><fz-scroll-area orientation="horizontal" aria-label="Colors"><p>Wide content</p></fz-scroll-area></div>`,
})
class RtlHost {}

// jsdom has no layout: give the viewport sizes by hand.
function size(el: HTMLElement, sizes: Record<string, number>) {
  for (const [k, v] of Object.entries(sizes)) Object.defineProperty(el, k, { value: v, configurable: true, writable: true });
}

describe('FzScrollArea', () => {
  it('becomes a Tab stop only while its content overflows, and a named region', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('fz-scroll-area');
    const viewport = host.querySelector<HTMLElement>('[data-viewport]')!;
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Tags');
    expect(viewport.hasAttribute('tabindex')).toBe(false); // nothing to scroll (no layout)

    size(viewport, { scrollHeight: 600, clientHeight: 160, scrollTop: 0 });
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(viewport.getAttribute('tabindex')).toBe('0');
    expect(viewport.hasAttribute('data-more-start')).toBe(false);
    expect(viewport.hasAttribute('data-more-end')).toBe(true);

    size(viewport, { scrollHeight: 600, clientHeight: 160, scrollTop: 440 });
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(viewport.hasAttribute('data-more-start')).toBe(true);
    expect(viewport.hasAttribute('data-more-end')).toBe(false);

    fixture.componentInstance.label.set(undefined);
    await fixture.whenStable();
    expect(viewport.hasAttribute('role')).toBe(false);
  });

  it('sideways in RTL, where scrollLeft runs from 0 down to minus the overflow, the fades follow the reading direction', async () => {
    const fixture = TestBed.createComponent(RtlHost);
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('[data-viewport]') as HTMLElement;
    size(viewport, { scrollWidth: 600, clientWidth: 200, scrollLeft: 0 });
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect([viewport.hasAttribute('data-more-start'), viewport.hasAttribute('data-more-end')]).toEqual([false, true]);
    size(viewport, { scrollLeft: -400 });
    viewport.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect([viewport.hasAttribute('data-more-start'), viewport.hasAttribute('data-more-end')]).toEqual([true, false]);
  });
});
