import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_POPOVER } from './popover';

@Component({
  imports: [FZ_POPOVER],
  template: `
    <button [fzPopoverTrigger]="pop">Dimensions</button>
    <div fzPopover #pop="fzPopover" aria-label="Dimensions">
      <label>Width <input data-p="width" /></label>
      <button data-p="apply" (click)="pop.close()">Apply</button>
    </div>
    <button data-p="outside">Elsewhere</button>
  `,
})
class Host {}

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
  const el: HTMLElement = fixture.nativeElement;
  const trigger = el.querySelector<HTMLElement>('button[aria-haspopup]')!;
  const panel = document.querySelector<HTMLElement>('[role=dialog]')!;
  const q = (name: string) => document.querySelector<HTMLElement>(`[data-p=${name}]`)!;
  const stable = () => fixture.whenStable();
  const open = async () => (trigger.click(), await stable());
  return { trigger, panel, q, stable, open };
}

describe('FzPopover', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('is a closed, hidden dialog wired to its trigger', async () => {
    const { trigger, panel } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.id).toMatch(/^fz-popover-/);
    expect(panel.classList).toContain('hidden');
  });

  it('click opens and focuses the first field; Escape closes and gives focus back', async () => {
    const { trigger, panel, q, stable, open } = await setup();
    trigger.focus();
    await open();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.classList).not.toContain('hidden');
    expect(document.activeElement).toBe(q('width'));
    q('width').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.classList).toContain('hidden');
    expect(document.activeElement).toBe(trigger);
  });

  it('the trigger toggles; a click outside closes without stealing focus', async () => {
    const { trigger, q, stable, open } = await setup();
    await open();
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); // inside: ignored
    await open();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await open();
    q('outside').focus();
    q('outside').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(q('outside'));
  });

  it('focus leaving the panel closes it; a button inside can close it', async () => {
    const { trigger, q, stable, open } = await setup();
    await open();
    q('outside').focus(); // focusout with relatedTarget outside
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await open();
    q('apply').focus(); // focus moving inside keeps it open
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    q('apply').click();
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closing plays the exit animation: focus returns at once, panel inert until it ends, a reopen cancels it', async () => {
    const anim = fakeExitAnimation();
    try {
      const { trigger, panel, q, stable, open } = await setup();
      trigger.focus();
      await open();
      q('apply').click();
      await stable();
      expect(document.activeElement).toBe(trigger);
      expect(panel.hasAttribute('data-closing')).toBe(true);
      expect(panel.inert).toBe(true);
      expect(panel.closest('.cdk-overlay-pane')).not.toBeNull(); // still on screen, fading

      await open(); // reopened while fading: back to normal, focus inside again
      expect(panel.hasAttribute('data-closing')).toBe(false);
      expect(panel.inert).toBe(false);
      expect(panel.contains(document.activeElement)).toBe(true);

      q('apply').click();
      await stable();
      await anim.finish();
      await stable();
      expect(panel.closest('.cdk-overlay-pane')).toBeNull();
      expect(panel.classList).toContain('hidden');
      expect(panel.hasAttribute('data-closing')).toBe(false);
    } finally {
      anim.restore();
    }
  });
});
