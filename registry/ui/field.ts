import { Directive, ElementRef, afterEveryRender, inject, input } from '@angular/core';

// What counts as the field's control: the first one inside it.
const CONTROL = 'input:not([type=hidden]), textarea, select, [role=combobox], [role=listbox], [role=radiogroup], [role=switch], [role=slider], button[aria-haspopup]';
let nextId = 0;

/**
 * Wires a label, a control, a hint and an error together:
 * `<div fzField>` + `<label fzLabel>` + any control + `<p fzFieldDescription>` + `<p fzFieldError>`.
 * The label points at the control (`for`, or `aria-labelledby` when the control is not an input; a popup
 * button such as a date picker keeps its own text after the label),
 * the hint and the error describe it (`aria-describedby`), and while an error is shown the control
 * is `aria-invalid`. Show the error with `@if`; it is announced when it appears.
 * `orientation="horizontal"` puts the control beside the label (checkbox, switch).
 */
@Directive({
  selector: '[fzField]',
  host: {
    '[attr.data-orientation]': 'orientation()',
    class:
      'group/field grid gap-2 data-[orientation=horizontal]:flex data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:items-center ' +
      'data-invalid:[&_label]:text-destructive',
  },
})
export class FzField {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly id = `fz-field-${nextId++}`;
  private invalidSet = false;

  constructor() {
    // DOM-driven, so any control works (native, fz-select, a radiogroup…) and @if'd errors are seen.
    afterEveryRender({ write: () => this.wire() });
  }

  private wire() {
    const control = this.el.querySelector<HTMLElement>(CONTROL);
    const label = this.el.querySelector('label');
    const description = this.el.querySelector<HTMLElement>('[fzFieldDescription]');
    const error = this.el.querySelector<HTMLElement>('[fzFieldError]');
    this.el.toggleAttribute('data-invalid', !!error);
    if (!control) return;

    control.id ||= `${this.id}-control`;
    if (label && !label.contains(control)) {
      // A button (a date picker) keeps its text in the name, after the label: "Birth date, 3 Mar 2026".
      // Not label[for]: clicking the label would press the button.
      if (control instanceof HTMLButtonElement) {
        if (!control.hasAttribute('aria-labelledby')) control.setAttribute('aria-labelledby', `${(label.id ||= `${this.id}-label`)} ${control.id}`);
      } else if ('labels' in control) label.htmlFor ||= control.id;
      else if (!control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby'))
        control.setAttribute('aria-labelledby', (label.id ||= `${this.id}-label`));
    }

    // Keep the user's own ids, replace ours with the ones present now.
    const ours = [`${this.id}-description`, `${this.id}-error`];
    if (description) description.id = ours[0];
    if (error) error.id = ours[1];
    const ids = (control.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && !ours.includes(id));
    ids.push(...[description, error].filter((e) => !!e).map((e) => e!.id));
    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');

    if (error) {
      this.invalidSet ||= control.getAttribute('aria-invalid') !== 'true';
      control.setAttribute('aria-invalid', 'true');
    } else if (this.invalidSet) {
      control.removeAttribute('aria-invalid');
      this.invalidSet = false;
    }
  }
}

@Directive({ selector: '[fzFieldDescription]', host: { class: 'text-sm text-muted-foreground group-data-[orientation=horizontal]/field:basis-full' } })
export class FzFieldDescription {}

/** The error message: `role="alert"`, so it is read when it appears. */
@Directive({ selector: '[fzFieldError]', host: { role: 'alert', class: 'text-sm text-destructive group-data-[orientation=horizontal]/field:basis-full' } })
export class FzFieldError {}

export const FZ_FIELD = [FzField, FzFieldDescription, FzFieldError] as const;
