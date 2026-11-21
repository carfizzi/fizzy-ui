import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzAvatar } from './avatar';

@Component({ imports: [FzAvatar], template: `<fz-avatar [src]="src()" [alt]="alt()" fallback="AL" />` })
class Host {
  src = signal<string | undefined>('ada.png');
  alt = signal('Ada Lovelace');
}

async function setup(init?: (h: Host) => void) {
  const fixture = TestBed.createComponent(Host);
  init?.(fixture.componentInstance);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  const img = () => el.querySelector('img');
  const fallback = () => el.querySelector('span');
  const fire = async (type: 'load' | 'error') => {
    img()!.dispatchEvent(new Event(type));
    await fixture.whenStable();
  };
  return { fixture, img, fallback, fire };
}

describe('FzAvatar', () => {
  it('shows the fallback while loading, then the image', async () => {
    const { img, fallback, fire } = await setup();
    expect(img()!.classList).toContain('hidden');
    expect(fallback()!.textContent!.trim()).toBe('AL');

    await fire('load');
    expect(img()!.classList).not.toContain('hidden');
    expect(img()!.alt).toBe('Ada Lovelace');
    expect(fallback()).toBeNull();
  });

  it('falls back on error and retries on a new src', async () => {
    const { fixture, img, fallback, fire } = await setup();
    await fire('error');
    expect(img()).toBeNull();
    expect(fallback()!.getAttribute('role')).toBe('img');
    expect(fallback()!.getAttribute('aria-label')).toBe('Ada Lovelace');

    fixture.componentInstance.src.set('ada2.png');
    await fixture.whenStable();
    expect(img()!.getAttribute('src')).toBe('ada2.png');
  });

  it('uses the fallback when there is no src', async () => {
    const { img, fallback } = await setup((h) => h.src.set(undefined));
    expect(img()).toBeNull();
    expect(fallback()!.textContent).toContain('AL');
  });

  it('empty alt makes the fallback decorative', async () => {
    const { fallback } = await setup((h) => (h.src.set(undefined), h.alt.set('')));
    expect(fallback()!.hasAttribute('role')).toBe(false);
    expect(fallback()!.hasAttribute('aria-label')).toBe(false);
    expect(fallback()!.getAttribute('aria-hidden')).toBe('true');
  });
});
