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
    <ng-template fzDialog bare align="top" #plain="fzDialog"><h2 fzDialogTitle class="sr-only">Search</h2><input aria-label="Query" /></ng-template>
    <ng-template fzDialog role="alertdialog" #confirm="fzDialog">
      <h2 fzDialogTitle>Delete?</h2>
      <p fzDialogDescription data-d="desc">This cannot be undone.</p>
      <button data-d="delete" fzDialogClose="deleted">Delete</button>
      <button data-d="cancel" fzDialogClose cdkFocusInitial>Cancel</button>
    </ng-template>
  `,
})
class Host {
  readonly dialog = viewChild.required('dlg', { read: FzDialog });
  readonly sheet = viewChild.required('sheet', { read: FzDialog });
  readonly confirm = viewChild.required('confirm', { read: FzDialog });
  readonly plain = viewChild.required('plain', { read: FzDialog });
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

  it('plays the exit animation before closing: focus stays inside meanwhile, later closes wait, first result wins', async () => {
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
      expect(pane.contains(document.activeElement)).toBe(true);
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

  it('in a background tab it closes at once (animations would not run)', async () => {
    const { q, dialogEl, host, stable } = await setup();
    const proto = HTMLElement.prototype as unknown as { getAnimations?: () => unknown[] };
    const original = proto.getAnimations;
    proto.getAnimations = () => [{ finished: new Promise(() => {}) }]; // would never end
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    try {
      host.dialog().open();
      await stable();
      q('save').click();
      await stable();
      expect(dialogEl()).toBeNull();
    } finally {
      proto.getAnimations = original;
      delete (document as unknown as Record<string, unknown>)['hidden'];
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

  it('role="alertdialog": described, focus inside, a backdrop click does not close it, Escape does', async () => {
    const { q, dialogEl, host, stable } = await setup();
    const ref = host.confirm().open();
    let result: unknown = 'none';
    ref.closed.subscribe((r) => (result = r));
    await stable();
    const dialog = dialogEl() ?? document.querySelector<HTMLElement>('[role=alertdialog]')!;
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-describedby')).toBe(q('desc').id);
    // jsdom has no layout, so the CDK finds nothing visible to focus and falls back to the container;
    // cdkFocusInitial landing on Cancel is checked in Chrome.
    expect(dialog.contains(document.activeElement)).toBe(true);

    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await stable();
    expect(document.querySelector('[role=alertdialog]')).not.toBeNull();

    q('cancel').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    await stable();
    expect(document.querySelector('[role=alertdialog]')).toBeNull();
    expect(result).toBeUndefined();
  });

  it('a plain dialog gets aria-describedby only when it has a description', async () => {
    const { dialogEl, host, stable } = await setup();
    host.dialog().open();
    await stable();
    expect(dialogEl()!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('bare + align="top": no panel look, anchored near the top; same size, animation and behavior', async () => {
    const { host, dialogEl, stable } = await setup();
    host.plain().open();
    await stable();
    const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
    for (const c of ['border', 'bg-background', 'p-6', 'shadow-lg']) expect(pane.classList).not.toContain(c);
    for (const c of ['max-w-lg!', 'animate-fz-dialog']) expect(pane.classList).toContain(c);
    // align="top": anchored near the top, growing from there
    expect(pane.style.marginTop).toBe('12vh');
    expect(pane.classList).toContain('origin-top');
    expect(dialogEl()!.contains(document.activeElement)).toBe(true);
  });
});
