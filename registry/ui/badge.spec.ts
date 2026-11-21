import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FzBadge } from './badge';

@Component({
  imports: [FzBadge],
  template: `<span fzBadge>New</span><span fzBadge variant="outline">Draft</span><span fzBadge variant="destructive">Error</span>`,
})
class Host {}

describe('FzBadge', () => {
  it('applies the variant classes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [def, outline, destructive] = fixture.nativeElement.querySelectorAll('span') as NodeListOf<HTMLElement>;
    expect(def.classList).toContain('bg-primary');
    expect(outline.classList).toContain('text-foreground');
    expect(outline.classList).not.toContain('bg-primary');
    expect(destructive.classList).toContain('bg-destructive');
    expect(destructive.classList).toContain('text-destructive-foreground');
    expect(destructive.classList).toContain('text-xs');
  });
});
