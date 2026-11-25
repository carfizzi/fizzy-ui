import { Component, resource } from '@angular/core';
import { CodeBlock } from '../code-block';
import { FormsExample } from './forms-example';

const REACTIVE = `<fz-select [formControl]="room" placeholder="Pick a room">…</fz-select>
<fz-date-picker formControlName="arrival" />`;
const NG_MODEL = `<fz-select [(ngModel)]="room" name="room" required>…</fz-select>`;

@Component({
  imports: [CodeBlock, FormsExample],
  template: `
    <article class="flex max-w-2xl flex-col gap-6">
      <h1 class="text-3xl font-bold tracking-tight">Forms</h1>
      <p class="text-lg text-muted-foreground">Every control works with Signal Forms, Reactive Forms and ngModel.</p>
      <p>
        Native controls (input, textarea, checkbox, switch, radio, slider) are real form elements, so Angular binds them as usual.
        The others (select, multiselect, combobox, chips, input OTP, calendar, date picker, toggle group) are form controls too:
        each has a <code class="rounded bg-muted px-1">value</code> model, a <code class="rounded bg-muted px-1">disabled</code> input
        and a <code class="rounded bg-muted px-1">touch</code> output that fires when focus leaves it. No ControlValueAccessor:
        Angular binds those directly.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Signal Forms</h2>
      <div class="rounded-lg border p-6"><app-forms-example /></div>
      @if (source.hasValue()) {
        <app-code-block [code]="source.value()" label="Signal Forms example" />
      }

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Reactive Forms and ngModel</h2>
      <p>The same controls, with <code class="rounded bg-muted px-1">ReactiveFormsModule</code> or <code class="rounded bg-muted px-1">FormsModule</code> imported:</p>
      <app-code-block [code]="reactive" label="Reactive Forms" />
      <app-code-block [code]="ngModel" label="ngModel" />

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Errors</h2>
      <ul class="list-disc space-y-1 pl-6">
        <li>
          Put the control in <code class="rounded bg-muted px-1">fzField</code> and show the error with
          <code class="rounded bg-muted px-1">&#64;if</code> when the field is touched and invalid. While the error is there, the control is
          <code class="rounded bg-muted px-1">aria-invalid</code> (red border, red label) and described by it; screen readers announce it.
        </li>
        <li>Submitting a Signal Form (<code class="rounded bg-muted px-1">[formRoot]</code>) marks every field touched, so all errors show.</li>
        <li>
          Forms set some inputs by name: <code class="rounded bg-muted px-1">disabled</code>, <code class="rounded bg-muted px-1">required</code>,
          <code class="rounded bg-muted px-1">min</code>, <code class="rounded bg-muted px-1">max</code>. A required toggle group keeps one
          item pressed; <code class="rounded bg-muted px-1">minDate</code>/<code class="rounded bg-muted px-1">maxDate</code> reach the
          calendar. That is why the calendar's unavailable days are <code class="rounded bg-muted px-1">dateDisabled</code> and the
          input OTP's character set is <code class="rounded bg-muted px-1">charset</code>.
        </li>
        <li>A null value (<code class="rounded bg-muted px-1">reset()</code>, ngModel before its first value) reads as empty.</li>
      </ul>
    </article>
  `,
})
export class FormsPage {
  protected readonly reactive = REACTIVE;
  protected readonly ngModel = NG_MODEL;
  protected readonly source = resource({
    loader: () => import('./forms-example', { with: { loader: 'text' } }).then((m) => (m as unknown as { default: string }).default),
  });
}
