import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzTextarea } from './textarea';

@Component({ imports: [FzTextarea], template: `<textarea fzTextarea rows="4"></textarea>` })
class Host {}

describe('FzTextarea', () => {
  it('applies its classes and keeps native attributes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const ta: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    for (const c of ['border', 'min-h-16', 'focus-visible:ring-ring', 'aria-invalid:border-destructive']) {
      expect(ta.classList).toContain(c);
    }
    expect(ta.rows).toBe(4);
  });
});
