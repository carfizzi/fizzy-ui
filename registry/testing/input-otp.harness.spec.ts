import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/input-otp';
import { FzInputOtpHarness } from './input-otp.harness';

describe('FzInputOtpHarness', () => {
  it('sets a code (dropping what the charset refuses) and reads it back', async () => {
    const fixture = TestBed.createComponent(Demo);
    const [code] = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(FzInputOtpHarness);
    expect(await code.getLength()).toBe(6);
    await code.setValue('12a3 456');
    expect(await code.getValue()).toBe('123456');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Verified.');
  });
});
