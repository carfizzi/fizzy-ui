import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/popover';
import { FzPopoverHarness } from './popover.harness';

beforeAll(() => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  proto['showPopover'] ??= function () {};
  proto['hidePopover'] ??= function () {};
});

describe('FzPopoverHarness', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('opens from its trigger, reads the panel, finds an input inside it, closes with Escape', async () => {
    const fixture = TestBed.createComponent(Demo);
    document.body.appendChild(fixture.nativeElement);
    const pop = await TestbedHarnessEnvironment.loader(fixture).getHarness(FzPopoverHarness.with({ triggerText: 'Dimensions' }));
    expect(await pop.isOpen()).toBe(false);
    expect(await pop.getPanelText()).toContain('Width');
    expect(await pop.isOpen()).toBe(true);
    expect(await pop.getPanelLabel()).toBe('Dimensions');
    const panel = await pop.getPanelLoader();
    expect(await panel.getChildLoader('input').then(() => true)).toBe(true);
    await pop.close();
    expect(await pop.isOpen()).toBe(false);
  });
});
