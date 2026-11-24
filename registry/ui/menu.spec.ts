import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_MENU } from './menu';

@Component({
  imports: [FZ_MENU],
  template: `
    <button [fzMenuTrigger]="file.menu">File</button>
    <div fzMenu #file="fzMenu" (itemSelected)="picked.set($event)">
      <div fzMenuItem value="new">New</div>
      <div fzMenuItem value="share" [submenu]="share.menu">Share</div>
      <div fzMenuSeparator></div>
      <div fzMenuItem value="delete" [disabled]="true">Delete</div>
    </div>
    <div fzMenu #share="fzMenu" (itemSelected)="picked.set($event)">
      <div fzMenuItem value="email">Email</div>
      <div fzMenuItem value="link">Link</div>
    </div>
  `,
})
class Host {
  picked = signal<unknown>(undefined);
}

const key = (k: string) =>
  (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));


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
  const trigger = el.querySelector('button')!;
  const [file, share] = [...el.querySelectorAll<HTMLElement>('[fzMenu]')];
  const items = (m: HTMLElement) => [...m.querySelectorAll<HTMLElement>(':scope > [fzMenuItem]')];
  const stable = () => fixture.whenStable();
  return { fixture, trigger, file, share, items, stable };
}

describe('FzMenu', () => {
  // jsdom has no popover API, and without it CDK puts overlays in a global container. Browsers
  // insert them inline next to the anchor, which keeps a submenu inside its parent menu: Aria
  // relies on that to keep the parent open. These no-op stubs make jsdom take the browser path.
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  beforeAll(() => ['showPopover', 'hidePopover', 'togglePopover'].forEach((m) => (proto[m] ??= () => {})));
  afterEach(() => (document.body.innerHTML = ''));

  it('is closed and hidden until the trigger is clicked', async () => {
    const { trigger, file, items, stable } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(file.getAttribute('data-visible')).toBe('false');
    expect(file.getAttribute('role')).toBe('menu');

    trigger.click();
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(file.id);
    expect(file.getAttribute('data-visible')).toBe('true');
    expect(file.closest('.cdk-overlay-pane')).not.toBeNull();
    expect(document.activeElement).toBe(items(file)[0]);
  });

  it('arrows move focus, Enter selects, closes and returns focus', async () => {
    const { fixture, trigger, file, items, stable } = await setup();
    trigger.click();
    await stable();
    key('ArrowDown');
    await stable();
    expect(document.activeElement).toBe(items(file)[1]);
    key('ArrowUp');
    await stable();
    key('Enter');
    await stable();
    expect(fixture.componentInstance.picked()).toBe('new');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(file.getAttribute('data-visible')).toBe('false');
    expect(file.closest('.cdk-overlay-pane')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape closes and returns focus to the trigger', async () => {
    const { trigger, stable } = await setup();
    trigger.click();
    await stable();
    key('Escape');
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('typeahead finds an item by its text, without a searchTerm', async () => {
    const { trigger, file, items, stable } = await setup();
    trigger.click();
    await stable();
    key('s');
    await stable();
    expect(document.activeElement).toBe(items(file)[1]);
    expect(file.getAttribute('data-visible')).toBe('true');
  });

  it('ArrowRight opens the submenu, ArrowLeft goes back', async () => {
    const { fixture, trigger, file, share, items, stable } = await setup();
    trigger.click();
    await stable();
    key('ArrowDown');
    await stable();
    const shareItem = items(file)[1];
    expect(shareItem.getAttribute('aria-haspopup')).toBe('true');

    key('ArrowRight');
    await stable();
    expect(shareItem.getAttribute('aria-expanded')).toBe('true');
    expect(share.getAttribute('data-visible')).toBe('true');
    expect(file.contains(share)).toBe(true);
    expect(document.activeElement).toBe(items(share)[0]);

    key('ArrowLeft');
    await stable();
    expect(shareItem.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(shareItem);

    key('ArrowRight');
    await stable();
    key('ArrowDown');
    await stable();
    key('Enter');
    await stable();
    expect(fixture.componentInstance.picked()).toBe('link');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('disabled item is not selected', async () => {
    const { fixture, trigger, file, items, stable } = await setup();
    trigger.click();
    await stable();
    const del = items(file)[2];
    expect(del.getAttribute('aria-disabled')).toBe('true');
    del.click();
    await stable();
    expect(fixture.componentInstance.picked()).toBeUndefined();
  });

  it('closing fades out: focus returns at once, menu inert until it ends, a reopen cancels it', async () => {
    const anim = fakeExitAnimation();
    try {
      const { trigger, file, items, stable } = await setup();
      const open = async () => (trigger.click(), await stable());
      await open();
      key('Escape');
      await stable();
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(file.hasAttribute('data-closing')).toBe(true);
      expect(file.inert).toBe(true);
      expect(file.closest('.cdk-overlay-pane')).not.toBeNull(); // still on screen, fading

      await open(); // reopened while fading: back to normal
      expect(file.hasAttribute('data-closing')).toBe(false);
      expect(file.inert).toBe(false);
      expect(document.activeElement).toBe(items(file)[0]);

      key('Escape');
      await stable();
      await anim.finish();
      await stable();
      expect(file.closest('.cdk-overlay-pane')).toBeNull();
      expect(file.hasAttribute('data-closing')).toBe(false);
      expect(file.inert).toBe(false);
    } finally {
      anim.restore();
    }
  });
});
