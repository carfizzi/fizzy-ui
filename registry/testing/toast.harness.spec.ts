import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo } from '../../src/app/demos/toast';
import { FzToastHarness } from './toast.harness';

describe('FzToastHarness', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('reads title, description, variant and action; runs the action; dismisses', async () => {
    const fixture = TestBed.createComponent(Demo);
    document.body.appendChild(fixture.nativeElement);
    const button = (text: string) => [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find((b) => b.textContent!.trim() === text)!;
    button('Delete').click();
    button('Fail').click();
    const root = TestbedHarnessEnvironment.documentRootLoader(fixture);

    const deleted = await root.getHarness(FzToastHarness.with({ title: 'File deleted' }));
    expect(await deleted.getDescription()).toBe('report.pdf was moved to the trash.');
    expect(await deleted.getActionLabel()).toBe('Undo');
    const failed = await root.getHarness(FzToastHarness.with({ title: 'Upload failed' }));
    expect(await failed.getVariant()).toBe('destructive');
    expect(await failed.getActionLabel()).toBeNull();

    await deleted.clickAction();
    expect(await root.getHarness(FzToastHarness.with({ title: 'File restored' }))).toBeTruthy();
    await failed.dismiss();
    expect(await root.getAllHarnesses(FzToastHarness.with({ title: /File deleted|Upload failed/ }))).toEqual([]);
  });
});
