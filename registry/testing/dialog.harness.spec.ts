import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Demo as DialogDemo } from '../../src/app/demos/dialog';
import { Demo as AlertDialogDemo } from '../../src/app/demos/alert-dialog';
import { FzDialogHarness } from './dialog.harness';

async function open<T>(demo: Type<T>) {
  const fixture = TestBed.createComponent(demo);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
  await fixture.whenStable();
  return TestbedHarnessEnvironment.documentRootLoader(fixture);
}

describe('FzDialogHarness', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('finds the open dialog by title, reads its role, description and content, closes with Escape', async () => {
    const root = await open(DialogDemo);
    const dialog = await root.getHarness(FzDialogHarness.with({ title: 'Edit profile' }));
    expect(await dialog.getRole()).toBe('dialog');
    expect(await dialog.getDescriptionText()).toBe('Make changes to your profile here.');
    expect(await dialog.getText()).toContain('Name');
    await dialog.close();
    expect(await root.getAllHarnesses(FzDialogHarness)).toEqual([]);
  });

  it('an alert dialog has role alertdialog and still closes on Escape', async () => {
    const root = await open(AlertDialogDemo);
    const dialog = await root.getHarness(FzDialogHarness);
    expect(await dialog.getRole()).toBe('alertdialog');
    expect(await dialog.getTitleText()).toBe('Delete your account?');
    await dialog.close();
    expect(await root.getAllHarnesses(FzDialogHarness)).toEqual([]);
  });
});
