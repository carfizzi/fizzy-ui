import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzSkeleton } from './skeleton';

@Component({ imports: [FzSkeleton], template: `<div fzSkeleton class="h-4 w-32"></div>` })
class Host {}

describe('FzSkeleton', () => {
  it('pulses, uses the muted token, keeps user classes and is hidden from AT', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('[fzSkeleton]');
    for (const c of ['animate-pulse', 'bg-muted', 'h-4', 'w-32']) expect(el.classList).toContain(c);
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
