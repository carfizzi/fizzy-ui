import { Component, computed, input, linkedSignal, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FZ_TABS } from '../../../registry/ui/tabs';
import { CodeBlock } from '../code-block';
import { DOCS } from '../docs';

/** `/components/:name`: demo, usage code, install command, keyboard and a11y notes, and the file itself. */
@Component({
  imports: [NgComponentOutlet, RouterLink, FZ_TABS, CodeBlock],
  template: `
    @if (doc(); as d) {
      <article class="flex flex-col gap-8">
        <header class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold tracking-tight">{{ d.title }}</h1>
          <p class="text-lg text-muted-foreground">{{ d.description }}</p>
        </header>

        <h2 class="sr-only">Example</h2>
        <div fzTabs>
          <ul fzTabList [(selectedTab)]="tab" aria-label="Example">
            <li fzTab value="preview">Preview</li>
            <li fzTab value="code">Code</li>
          </ul>
          <div fzTabPanel value="preview">
            <ng-template ngTabContent>
              <!-- The demo host gets the full width and centers its content, so w-full demos (accordion, card) don't shrink to their text. -->
              <div class="flex min-h-48 items-center justify-center rounded-md border p-6 sm:p-10 [&>*]:flex [&>*]:w-full [&>*]:justify-center">
                @if (files.hasValue()) {
                  <ng-container *ngComponentOutlet="files.value()[0]" />
                } @else if (files.error()) {
                  <p class="text-sm text-destructive">Could not load the example.</p>
                } @else {
                  <p class="text-sm text-muted-foreground">Loading…</p>
                }
              </div>
            </ng-template>
          </div>
          <div fzTabPanel value="code">
            <ng-template ngTabContent>
              <app-code-block [code]="usage()" label="example code" />
            </ng-template>
          </div>
        </div>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold tracking-tight">Installation</h2>
          <app-code-block [code]="'npx fizzy-ui add ' + d.name" label="install command" />
          <p class="text-sm text-muted-foreground">
            Copies <code class="rounded bg-muted px-1">{{ d.file }}</code> into <code class="rounded bg-muted px-1">src/app/ui/</code>
            and installs what it needs. Run <a routerLink="/installation" class="underline underline-offset-4">init</a> once first.
          </p>
        </section>

        @if (d.keyboard) {
          <section class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold tracking-tight">Keyboard</h2>
            <div class="overflow-x-auto rounded-md border">
              <table class="w-full text-sm">
                <thead class="bg-muted/50 text-left">
                  <tr><th scope="col" class="px-4 py-2 font-medium">Key</th><th scope="col" class="px-4 py-2 font-medium">Action</th></tr>
                </thead>
                <tbody>
                  @for (row of d.keyboard; track $index) {
                    <tr class="border-t">
                      <td class="whitespace-nowrap px-4 py-2"><kbd class="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{{ row[0] }}</kbd></td>
                      <td class="px-4 py-2 text-muted-foreground">{{ row[1] }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (d.a11y) {
          <section class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold tracking-tight">Accessibility</h2>
            <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              @for (note of d.a11y; track $index) {
                <li>{{ note }}</li>
              }
            </ul>
          </section>
        }

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold tracking-tight">Source</h2>
          <p class="text-sm text-muted-foreground">The exact file <code class="rounded bg-muted px-1">add</code> copies. It is yours to edit.</p>
          <details class="group rounded-md border">
            <summary class="cursor-pointer select-none px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {{ d.file }}
            </summary>
            <div class="border-t p-2">
              @if (files.hasValue()) {
                <app-code-block [code]="files.value()[2]" [label]="d.file + ' source'" />
              }
            </div>
          </details>
        </section>
      </article>
    } @else {
      <h1 class="text-3xl font-bold tracking-tight">Not found</h1>
      <p class="mt-2 text-muted-foreground">There is no component called “{{ name() }}”.</p>
    }
  `,
})
export class ComponentPage {
  /** Route param, bound by `withComponentInputBinding()`. */
  readonly name = input.required<string>();
  protected readonly doc = computed(() => DOCS.find((d) => d.name === this.name()));
  protected readonly tab = linkedSignal<string, string | undefined>({ source: this.name, computation: () => 'preview' });
  protected readonly files = resource({ params: () => this.doc(), loader: ({ params }) => params.load() });
  // Show the demo the way a user writes it: `add` puts the files in ./ui next to their component.
  protected readonly usage = computed(() => this.files.hasValue() ? this.files.value()[1].replaceAll('../../../registry/ui/', './ui/') : '');
}
