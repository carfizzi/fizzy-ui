import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzCloseButton } from './close-button';

@Component({
  imports: [FzCloseButton],
  template: `<button fzCloseButton (click)="clicks.set(clicks() + 1)"></button><button fzCloseButton aria-label="Dismiss banner" size="sm"></button>`,
})
class Host {
  readonly clicks = signal(0);
}

describe('FzCloseButton', () => {
  it('is a button named Close by default, with a hidden icon', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [plain, named] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(plain.type).toBe('button');
    expect(plain.getAttribute('aria-label')).toBe('Close');
    expect(plain.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(named.getAttribute('aria-label')).toBe('Dismiss banner');
    expect(named.dataset['size']).toBe('sm');
    plain.click();
    expect(fixture.componentInstance.clicks()).toBe(1);
  });
});
