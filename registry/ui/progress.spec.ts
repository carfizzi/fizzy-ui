import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_PROGRESS } from './progress';

@Component({
  imports: [FZ_PROGRESS],
  template: `<progress fzProgress [value]="value()" max="100" aria-label="Upload"></progress><progress fzProgress aria-label="Loading"></progress>`,
})
class Host {
  value = signal(40);
}

describe('FzProgress', () => {
  it('is a native progress bar: value binds, no value is indeterminate', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [upload, loading] = fixture.nativeElement.querySelectorAll('progress') as NodeListOf<HTMLProgressElement>;
    expect(upload.value).toBe(40);
    expect(upload.max).toBe(100);
    fixture.componentInstance.value.set(80);
    await fixture.whenStable();
    expect(upload.value).toBe(80);

    expect(loading.hasAttribute('value')).toBe(false); // what makes it :indeterminate
    expect(loading.classList).toContain('indeterminate:animate-fz-indeterminate');
    expect(upload.classList).toContain('[&::-webkit-progress-value]:bg-primary');
    expect(upload.classList).toContain('[&::-moz-progress-bar]:bg-primary');
  });
});
