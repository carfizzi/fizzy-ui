import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_BREADCRUMB } from './breadcrumb';

@Component({
  imports: [FZ_BREADCRUMB],
  template: `
    <nav fzBreadcrumb data-t="a"><ol><li><a href="/">Home</a></li><li><span aria-current="page">Docs</span></li></ol></nav>
    <nav fzBreadcrumb aria-label="You are here" data-t="b"><ol><li>Only</li></ol></nav>
  `,
})
class Host {}

describe('FzBreadcrumb', () => {
  it('a nav labelled "Breadcrumb" (or your label); separators are CSS with no text', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const a = el.querySelector<HTMLElement>('[data-t=a]')!;
    expect(a.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(el.querySelector('[data-t=b]')!.getAttribute('aria-label')).toBe('You are here');
    expect(a.classList).toContain("[&_li+li]:before:content-['']");
    expect(a.textContent).toBe('HomeDocs'); // no separator text
  });
});
