import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_DIALOG, FzDialog } from './dialog';

@Component({
  imports: [FZ_DIALOG],
  template: `
    <button data-d="open" (click)="dlg.open()">Edit profile</button>
    <ng-template fzDialog #dlg="fzDialog">
      <h2 fzDialogTitle>Edit profile</h2>
      <input data-d="name" aria-label="Name" />
      <button data-d="save" fzDialogClose="saved">Save</button>
    </ng-template>
    <ng-template fzDialog side="right" #sheet="fzDialog"><h2 fzDialogTitle>Settings</h2></ng-template>
  `,
})
class Host {
  readonly dialog = viewChild.required('dlg', { read: FzDialog });
  readonly sheet = viewChild.required('sheet', { read: FzDialog });
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const q = (name: string) => document.querySelector<HTMLElement>(`[data-d=${name}]`)!;
  const dialogEl = () => document.querySelector<HTMLElement>('[role=dialog]');
  return { fixture, q, dialogEl, host: fixture.componentInstance, stable: () => fixture.whenStable() };
}

describe('FzDialog', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('opens a modal (rest of the page aria-hidden) named by its title, with focus inside and a focus trap', async () => {
    const { fixture, q, dialogEl, stable } = await setup();
    q('open').focus();
    q('open').click();
    await stable();
    const dialog = dialogEl()!;
    // CDK leaves aria-modal off on purpose and hides everything else from screen readers instead.
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    const title = dialog.querySelector('h2')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.id).toMatch(/^fz-dialog-title-/);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.querySelectorAll('.cdk-focus-trap-anchor').length).toBe(2);
    expect(document.querySelector('.cdk-overlay-backdrop')!.classList).toContain('bg-background/80');
  });

  it('Escape closes and gives focus back to the opener', async () => {
    const { q, dialogEl, stable } = await setup();
    q('open').focus();
    q('open').click();
    await stable();
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await stable();
    expect(dialogEl()).toBeNull();
    expect(document.activeElement).toBe(q('open'));
  });

  it('fzDialogClose closes with its result', async () => {
    const { q, host, stable } = await setup();
    const ref = host.dialog().open();
    let result: unknown;
    ref.closed.subscribe((r) => (result = r));
    await stable();
    q('save').click();
    await stable();
    expect(result).toBe('saved');
  });

  it('plays the exit animation before closing: inert meanwhile, later closes wait, first result wins', async () => {
    const { q, dialogEl, host, stable } = await setup();
    let finish!: () => void;
    const finished = new Promise<void>((r) => (finish = r));
    // jsdom has no Web Animations: pretend the pane has a running exit animation.
    const proto = HTMLElement.prototype as unknown as { getAnimations?: () => unknown[] };
    const original = proto.getAnimations;
    proto.getAnimations = function (this: HTMLElement) {
      return this.hasAttribute('data-closing') ? [{ finished }] : [];
    };
    try {
      q('open').focus();
      const ref = host.dialog().open();
      let result: unknown = 'not closed';
      ref.closed.subscribe((r) => (result = r));
      await stable();
      q('save').click();
      await stable();
      const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
      expect(dialogEl()).not.toBeNull();
      expect(pane.hasAttribute('data-closing')).toBe(true);
      expect(pane.inert).toBe(true);
      expect(result).toBe('not closed');
      ref.close('ignored'); // a second close while leaving waits for the first
      finish();
      await finished;
      await stable();
      expect(dialogEl()).toBeNull();
      expect(result).toBe('saved');
      expect(document.activeElement).toBe(q('open'));
    } finally {
      proto.getAnimations = original;
    }
  });

  it('side="right" is a full-height sheet', async () => {
    const { host, stable } = await setup();
    host.sheet().open();
    await stable();
    const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
    expect(pane.classList).toContain('border-l');
    expect(pane.style.height).toBe('100%');
    expect(pane.textContent).toContain('Settings');
  });
});
