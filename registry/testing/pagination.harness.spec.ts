import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/pagination';
import { FzPaginationHarness } from './pagination.harness';

describe('FzPaginationHarness', () => {
  it('reads the current page and the shown ones, moves by page, next and previous', async () => {
    const pager = await TestbedHarnessEnvironment.loader(TestBed.createComponent(Demo)).getHarness(FzPaginationHarness);
    expect(await pager.getCurrentPage()).toBe(5);
    expect((await pager.getPages()).at(-1)).toBe(12);
    await pager.goToPage(1);
    expect(await pager.isPreviousDisabled()).toBe(true);
    await pager.goToPage(12);
    expect(await pager.getCurrentPage()).toBe(12);
    expect(await pager.isNextDisabled()).toBe(true);
    await pager.previous();
    expect(await pager.getCurrentPage()).toBe(11);
    await pager.next();
    expect(await pager.getCurrentPage()).toBe(12);
  });
});
