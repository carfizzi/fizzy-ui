import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_CARD } from './card';

@Component({
  imports: [FZ_CARD],
  template: `
    <div fzCard>
      <div fzCardHeader><h3 fzCardTitle>Title</h3><p fzCardDescription>Desc</p></div>
      <div fzCardContent>Body</div>
      <div fzCardFooter>Footer</div>
    </div>
  `,
})
class Host {}

describe('FzCard', () => {
  it('applies classes to every part', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cls = (sel: string) => el.querySelector(sel)!.classList;
    expect(cls('[fzCard]')).toContain('border');
    expect(cls('[fzCard]')).toContain('bg-background');
    expect(cls('[fzCardHeader]')).toContain('px-6');
    expect(cls('[fzCardTitle]')).toContain('font-semibold');
    expect(cls('[fzCardDescription]')).toContain('text-muted-foreground');
    expect(cls('[fzCardContent]')).toContain('px-6');
    expect(cls('[fzCardFooter]')).toContain('flex');
  });
});
