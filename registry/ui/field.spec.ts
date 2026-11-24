import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FZ_FIELD } from './field';

@Component({
  imports: [FZ_FIELD],
  template: `
    <div fzField data-t="email">
      <label>Email</label>
      <input type="email" aria-describedby="extra" />
      <p fzFieldDescription>We only use it for receipts.</p>
      @if (error()) {
        <p fzFieldError>{{ error() }}</p>
      }
    </div>
    <p id="extra">Extra hint</p>
    <div fzField data-t="custom">
      <label>Plan</label>
      <div role="combobox" tabindex="0"></div>
    </div>
    <div fzField orientation="horizontal" data-t="check">
      <label><input type="checkbox" /> News</label>
    </div>
  `,
})
class Host {
  error = signal('');
}

describe('FzField', () => {
  it('labels the control, describes it with the hint (keeping other ids), and marks it invalid while an error shows', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('[data-t=email]') as HTMLElement;
    const input = field.querySelector('input')!;
    const hint = field.querySelector<HTMLElement>('[fzFieldDescription]')!;
    expect(input.id).toBeTruthy();
    expect(input.labels![0].textContent).toBe('Email');
    expect(input.getAttribute('aria-describedby')).toBe(`extra ${hint.id}`);
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.error.set('Enter your email.');
    await fixture.whenStable();
    const error = field.querySelector<HTMLElement>('[fzFieldError]')!;
    expect(error.getAttribute('role')).toBe('alert');
    expect(input.getAttribute('aria-describedby')).toBe(`extra ${hint.id} ${error.id}`);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(field.hasAttribute('data-invalid')).toBe(true);

    fixture.componentInstance.error.set('');
    await fixture.whenStable();
    expect(input.getAttribute('aria-describedby')).toBe(`extra ${hint.id}`);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(field.hasAttribute('data-invalid')).toBe(false);
  });

  it('a control that is not an input gets aria-labelledby; a label wrapping its control is left alone', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const combobox = el.querySelector<HTMLElement>('[data-t=custom] [role=combobox]')!;
    const label = el.querySelector<HTMLLabelElement>('[data-t=custom] label')!;
    expect(combobox.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.htmlFor).toBe('');

    const check = el.querySelector<HTMLElement>('[data-t=check]')!;
    expect(check.getAttribute('data-orientation')).toBe('horizontal');
    expect(check.querySelector('label')!.htmlFor).toBe('');
  });
});
