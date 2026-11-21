import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzInput } from './input';

@Component({ imports: [FzInput], template: `<input fzInput placeholder="Email" aria-invalid="true" disabled />` })
class Host {}

describe('FzInput', () => {
  it('applies base, invalid and disabled styles without touching native attributes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    for (const c of ['border', 'h-9', 'focus-visible:ring-ring', 'aria-invalid:border-destructive', 'aria-invalid:focus-visible:ring-destructive', 'disabled:opacity-50']) {
      expect(input.classList).toContain(c);
    }
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('Email');
  });
});
