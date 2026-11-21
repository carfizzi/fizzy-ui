import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzSeparator } from './separator';

@Component({
  imports: [FzSeparator],
  template: `<div fzSeparator></div><div fzSeparator orientation="vertical" decorative="false"></div>`,
})
class Host {}

describe('FzSeparator', () => {
  it('is decorative and horizontal by default', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const sep: HTMLElement = fixture.nativeElement.querySelector('[fzSeparator]');
    expect(sep.getAttribute('role')).toBe('none');
    expect(sep.getAttribute('data-orientation')).toBe('horizontal');
    expect(sep.hasAttribute('aria-orientation')).toBe(false);
    expect(sep.classList).toContain('bg-border');
  });

  it('semantic vertical separator exposes role and aria-orientation', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const sep: HTMLElement = fixture.nativeElement.querySelectorAll('[fzSeparator]')[1];
    expect(sep.getAttribute('role')).toBe('separator');
    expect(sep.getAttribute('aria-orientation')).toBe('vertical');
    expect(sep.getAttribute('data-orientation')).toBe('vertical');
  });
});
