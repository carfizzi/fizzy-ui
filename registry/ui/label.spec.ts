import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzLabel } from './label';

@Component({ imports: [FzLabel], template: `<label fzLabel for="x">Name</label><input id="x" />` })
class Host {}

describe('FzLabel', () => {
  it('styles the label and keeps the native for/id link', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(label.classList).toContain('text-sm');
    expect(label.classList).toContain('font-medium');
    expect(label.classList).toContain('[&:has(:disabled,+:disabled)]:opacity-50');
    expect(label.control).toBe(fixture.nativeElement.querySelector('input'));
  });
});
