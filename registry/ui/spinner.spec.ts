import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_SPINNER } from './spinner';

@Component({
  imports: [FZ_SPINNER],
  template: `<fz-spinner /><fz-spinner label="Saving" />`,
})
class Host {}

describe('FzSpinner', () => {
  it('is a status with hidden text; the svg is decorative and pulses under Reduce Motion', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [loading, saving] = fixture.nativeElement.querySelectorAll('fz-spinner') as NodeListOf<HTMLElement>;
    expect(loading.getAttribute('role')).toBe('status');
    expect(loading.querySelector('.sr-only')!.textContent).toBe('Loading');
    expect(saving.querySelector('.sr-only')!.textContent).toBe('Saving');
    const svg = loading.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.classList).toContain('animate-spin');
    expect(svg.classList).toContain('motion-reduce:animate-pulse');
  });
});
