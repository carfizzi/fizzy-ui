import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_TOOLTIP } from './tooltip';

@Component({
  imports: [FZ_TOOLTIP],
  template: `<button [fzTooltip]="text()" aria-describedby="hint">Save</button><p id="hint">Ctrl+S</p>`,
})
class Host {
  text = signal('Save the file');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const tip = document.querySelector<HTMLElement>('[role=tooltip]')!;
  return { fixture, button, tip };
}

describe('FzTooltip', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('describes its trigger (keeping existing descriptions) and starts hidden', async () => {
    const { fixture, button, tip } = await setup();
    expect(button.getAttribute('aria-describedby')).toBe(`hint ${tip.id}`);
    expect(tip.textContent).toBe('Save the file');
    expect(tip.hidden).toBe(true);
    fixture.componentInstance.text.set('Save now');
    await fixture.whenStable();
    expect(tip.textContent).toBe('Save now');
  });

  it('hover shows it after a delay; leaving hides it, unless the pointer moves onto it', async () => {
    const { button, tip } = await setup();
    vi.useFakeTimers();
    button.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(300);
    expect(tip.hidden).toBe(true);
    vi.advanceTimersByTime(300);
    expect(tip.hidden).toBe(false);

    button.dispatchEvent(new PointerEvent('pointerleave'));
    tip.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(200);
    expect(tip.hidden).toBe(false);
    tip.dispatchEvent(new PointerEvent('pointerleave'));
    vi.advanceTimersByTime(200);
    expect(tip.hidden).toBe(true);
  });

  it('a hover that leaves before the delay never shows it; Escape hides it', async () => {
    const { button, tip } = await setup();
    vi.useFakeTimers();
    button.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(200);
    button.dispatchEvent(new PointerEvent('pointerleave'));
    vi.advanceTimersByTime(1000);
    expect(tip.hidden).toBe(true);

    button.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(600);
    expect(tip.hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    vi.advanceTimersByTime(0);
    expect(tip.hidden).toBe(true);
  });

  it('keyboard focus shows it at once, blur hides it; mouse focus does not show it', async () => {
    const { button, tip } = await setup();
    vi.useFakeTimers();
    button.focus(); // jsdom: never :focus-visible, like a mouse click
    vi.advanceTimersByTime(0);
    expect(tip.hidden).toBe(true);
    button.blur();
    vi.spyOn(button, 'matches').mockImplementation((s) => s === ':focus-visible');
    button.focus();
    vi.advanceTimersByTime(0);
    expect(tip.hidden).toBe(false);
    button.blur();
    vi.advanceTimersByTime(0);
    expect(tip.hidden).toBe(true);
  });
});
