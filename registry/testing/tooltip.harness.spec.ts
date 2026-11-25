import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/tooltip';
import { FzTooltipHarness } from './tooltip.harness';

beforeAll(() => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  proto['showPopover'] ??= function () {};
  proto['hidePopover'] ??= function () {};
});

describe('FzTooltipHarness', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('reads the text without showing it; shows on hover after the delay; hides on Escape', async () => {
    const fixture = TestBed.createComponent(Demo);
    document.body.appendChild(fixture.nativeElement);
    const tip = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzTooltipHarness.with({ text: /clipboard/ }));
    expect(await tip.getText()).toBe('Copies the link to your clipboard');
    expect(await tip.isOpen()).toBe(false);
    await tip.show();
    expect(await tip.isOpen()).toBe(true);
    await tip.hide();
    expect(await tip.isOpen()).toBe(false);
  });
});
