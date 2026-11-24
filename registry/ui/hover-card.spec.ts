import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_HOVER_CARD } from './hover-card';

@Component({
  imports: [FZ_HOVER_CARD],
  template: `
    <a href="/u/ada" [fzHoverCardTrigger]="card">Ada</a>
    <div fzHoverCard #card="fzHoverCard"><a href="/u/ada/repos" data-h="inner">Repositories</a></div>
    <button data-h="outside">Elsewhere</button>
  `,
})
class Host {}

const pointer = (el: Element, type: 'pointerenter' | 'pointerleave', pointerType = 'mouse') => el.dispatchEvent(new PointerEvent(type, { pointerType }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const trigger = el.querySelector<HTMLAnchorElement>('a[href="/u/ada"]')!;
  const card = el.querySelector<HTMLElement>('[fzHoverCard]')!;
  const isOpen = () => card.getAttribute('data-open') === 'true';
  vi.useFakeTimers(); // after the first render: Angular's scheduler uses timers too
  const tick = async (ms: number) => {
    vi.advanceTimersByTime(ms);
    TestBed.tick();
  };
  return { fixture, el, trigger, card, isOpen, tick };
}

describe('FzHoverCard', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('a mouse hover opens it after the delay; the pointer can move onto it; leaving both closes it', async () => {
    const { trigger, card, isOpen, tick } = await setup();
    expect(isOpen()).toBe(false);
    pointer(trigger, 'pointerenter');
    await tick(400);
    expect(isOpen()).toBe(false);
    await tick(100);
    expect(isOpen()).toBe(true);
    expect(card.closest('.cdk-overlay-pane')).not.toBeNull();

    pointer(trigger, 'pointerleave');
    pointer(card, 'pointerenter'); // onto the card before the close delay ends
    await tick(1000);
    expect(isOpen()).toBe(true);
    pointer(card, 'pointerleave');
    await tick(300);
    expect(isOpen()).toBe(false);
  });

  it('a short hover never opens it; touch never does', async () => {
    const { trigger, isOpen, tick } = await setup();
    pointer(trigger, 'pointerenter');
    await tick(200);
    pointer(trigger, 'pointerleave');
    await tick(1000);
    expect(isOpen()).toBe(false);
    pointer(trigger, 'pointerenter', 'touch');
    await tick(1000);
    expect(isOpen()).toBe(false);
  });

  it('keyboard focus opens it at once; focus can move into it; leaving both closes it; Escape closes it', async () => {
    const { el, trigger, isOpen, tick } = await setup();
    const focusVisible = vi.spyOn(trigger, 'matches').mockReturnValue(false); // focus from a mouse click
    trigger.focus();
    await tick(0);
    expect(isOpen()).toBe(false);
    trigger.blur();
    focusVisible.mockImplementation((s) => s === ':focus-visible'); // focus from the keyboard
    trigger.focus();
    await tick(0);
    expect(isOpen()).toBe(true);

    const inner = document.querySelector<HTMLElement>('[data-h=inner]')!; // jsdom puts the overlay in a global container
    inner.focus(); // Tab into the card
    await tick(0);
    expect(isOpen()).toBe(true);
    el.querySelector<HTMLElement>('[data-h=outside]')!.focus();
    await tick(0);
    expect(isOpen()).toBe(false);

    trigger.focus();
    await tick(0);
    expect(isOpen()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick(0);
    expect(isOpen()).toBe(false);
  });
});
