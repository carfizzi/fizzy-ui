import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_PAGINATION, pageItems } from './pagination';

@Component({
  imports: [FZ_PAGINATION],
  template: `<fz-pagination [(page)]="page" [pageCount]="count()" />`,
})
class Host {
  page = signal(1);
  count = signal(10);
}

describe('pageItems', () => {
  it('first, last, current and neighbours; a one-page gap shows the page, a longer one is null', () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(1, 10)).toEqual([1, 2, null, 10]);
    expect(pageItems(3, 10)).toEqual([1, 2, 3, 4, null, 10]);
    expect(pageItems(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageItems(10, 10)).toEqual([1, null, 9, 10]);
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4]);
  });
});

describe('FzPagination', () => {
  it('a labelled nav; aria-current on the page; Previous/Next move and are aria-disabled at the ends', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const buttons = () => [...el.querySelectorAll<HTMLButtonElement>('button')];
    const byLabel = (l: string) => buttons().find((b) => (b.getAttribute('aria-label') ?? b.textContent!.trim()) === l)!;
    const stable = () => fixture.whenStable();

    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Pagination');
    expect(byLabel('Page 1').getAttribute('aria-current')).toBe('page');
    expect(byLabel('Previous').getAttribute('aria-disabled')).toBe('true');
    byLabel('Previous').click();
    await stable();
    expect(fixture.componentInstance.page()).toBe(1);

    byLabel('Next').click();
    await stable();
    expect(fixture.componentInstance.page()).toBe(2);
    expect(byLabel('Page 2').getAttribute('aria-current')).toBe('page');
    expect(byLabel('Page 1').hasAttribute('aria-current')).toBe(false);

    byLabel('Page 10').click();
    await stable();
    expect(byLabel('Next').getAttribute('aria-disabled')).toBe('true');
    byLabel('Next').click();
    await stable();
    expect(fixture.componentInstance.page()).toBe(10);
  });

  it('the clicked page button keeps focus when the list shifts', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.page.set(5);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const six = fixture.nativeElement.querySelector('[aria-label="Page 6"]') as HTMLButtonElement;
    six.focus();
    six.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(six);
    expect(six.getAttribute('aria-label')).toBe('Page 6');
    expect(six.getAttribute('aria-current')).toBe('page');
    document.body.innerHTML = '';
  });
});
