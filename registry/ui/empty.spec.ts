import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_EMPTY } from './empty';

@Component({
  imports: [FZ_EMPTY],
  template: `
    <div fzEmpty>
      <div fzEmptyMedia><svg aria-hidden="true"></svg></div>
      <h3 fzEmptyTitle>No projects</h3>
      <p fzEmptyDescription>Create one.</p>
    </div>
  `,
})
class Host {}

describe('FzEmpty', () => {
  it('styles each part and keeps the heading the user chose', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[fzEmpty]')!.classList).toContain('border-dashed');
    expect(el.querySelector('[fzEmptyMedia]')!.classList).toContain('bg-muted');
    expect(el.querySelector('h3')!.classList).toContain('font-semibold');
    expect(el.querySelector('[fzEmptyDescription]')!.classList).toContain('text-muted-foreground');
  });
});
