import { Component, ElementRef, computed, effect, input, linkedSignal, resource, signal, viewChild } from '@angular/core';
import axe from 'axe-core/package.json';
import { NgComponentOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FZ_KBD } from '../../../registry/ui/kbd';
import { FZ_TABS } from '../../../registry/ui/tabs';
import { CodeBlock } from '../code-block';
import { DOCS, SIZED } from '../docs';
import registry from '../../../registry/registry.json';
import cli from '../../../cli/package.json';

const ROOT_HARNESSES = ['FzDialogHarness', 'FzToastHarness'];

/** `/components/:name`: demo, usage code, install command, keyboard and a11y notes, and the file itself. */
@Component({
  imports: [NgComponentOutlet, RouterLink, FZ_KBD, FZ_TABS, CodeBlock],
  template: `
    @if (doc(); as d) {
      <article class="flex flex-col gap-8">
        <header class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold tracking-tight">{{ d.title }}</h1>
          <p class="text-lg text-muted-foreground">{{ d.description }}</p>
          <a [href]="'components/' + d.name + '.md'" class="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">View as Markdown</a>
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
              <div #demoHost class="flex min-h-48 items-center justify-center rounded-md border p-6 sm:p-10 [&>*]:flex [&>*]:w-full [&>*]:justify-center">
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

        @if (sized()) {
          <section class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold tracking-tight">Sizes</h2>
            <p class="text-sm text-muted-foreground">
              <code class="rounded bg-muted px-1">xs</code>, <code class="rounded bg-muted px-1">sm</code>,
              <code class="rounded bg-muted px-1">md</code> (default) and <code class="rounded bg-muted px-1">lg</code>: set
              <code class="rounded bg-muted px-1">size="sm"</code> on it, or <code class="rounded bg-muted px-1">data-size="sm"</code> on any
              container, as here. See <a routerLink="/theming" class="underline underline-offset-4">Theming</a>.
            </p>
            <div class="rounded-md border p-6">
              @if (sizes.hasValue()) {
                <ng-container *ngComponentOutlet="sizes.value(); inputs: { name: d.name }" />
              }
            </div>
          </section>
        }

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
                      <td class="whitespace-nowrap px-4 py-2">
                        @for (key of row[0].split(' / '); track $index) {
                          @if (!$first) {<span class="px-1 text-muted-foreground"> / </span>}
                          <kbd fzKbd>{{ key }}</kbd>
                        }
                      </td>
                      <td class="px-4 py-2 text-muted-foreground">{{ row[1] }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold tracking-tight">Accessibility</h2>
          <div class="flex flex-col gap-3 rounded-md border p-4 text-sm" data-a11y-box>
            <p class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                <svg aria-hidden="true" viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
                No axe-core violations
              </span>
              <span class="text-muted-foreground">
                axe-core {{ axeVersion }} checks this example, closed and with its panels open, on every build; the site is not published otherwise.
              </span>
            </p>
            @if (aria().roles.length || aria().attributes.length) {
              <dl class="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
                <dt class="font-medium">Roles</dt>
                <dd class="flex flex-wrap gap-1">
                  @for (r of aria().roles; track r) { <code class="rounded bg-muted px-1 text-xs">{{ r }}</code> } @empty { <span class="text-muted-foreground">native elements only</span> }
                </dd>
                <dt class="font-medium">ARIA</dt>
                <dd class="flex flex-wrap gap-1">
                  @for (a of aria().attributes; track a) { <code class="rounded bg-muted px-1 text-xs">{{ a }}</code> } @empty { <span class="text-muted-foreground">none</span> }
                </dd>
              </dl>
              <p class="text-xs text-muted-foreground">Read from the example above as you use it: open it, select, expand, and new ones appear.</p>
            }
          </div>
          @if (d.a11y) {
            <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              @for (note of d.a11y; track $index) {
                <li>{{ note }}</li>
              }
            </ul>
          }
        </section>

        @if (testing(); as t) {
          <section class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold tracking-tight">Testing</h2>
            <p class="text-sm text-muted-foreground">
              <code class="rounded bg-muted px-1">{{ t.harness }}</code> drives it in your tests, the way a user would, with the Angular CDK
              harness API. <code class="rounded bg-muted px-1">--harness</code> also copies <code class="rounded bg-muted px-1">{{ t.file }}</code>;
              its methods are documented <a [href]="t.url" class="underline underline-offset-4">in the file</a>.
            </p>
            <app-code-block [code]="'npx fizzy-ui add ' + d.name + ' --harness'" label="install command with the harness" />
            <app-code-block [code]="t.usage" label="test example" />
          </section>
        }

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold tracking-tight">Source</h2>
          <p class="text-sm text-muted-foreground">The exact file <code class="rounded bg-muted px-1">add</code> copies. It is yours to edit.</p>
          <details class="group rounded-md border">
            <summary class="flex cursor-pointer list-none select-none items-center gap-2 rounded-md px-4 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0 text-muted-foreground group-open:rotate-90 motion-safe:transition-transform motion-safe:duration-(--fz-duration-popup) motion-safe:ease-spring" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
              {{ d.file }}
            </summary>
            <div class="border-t p-2">
              @if (files.hasValue()) {
                <app-code-block [code]="files.value()[2]" [label]="d.file + ' source'" />
              }
            </div>
          </details>
        </section>

        <nav aria-label="Components" class="mt-4 grid grid-cols-2 gap-4 border-t pt-8">
          @if (prev(); as p) {
            <a [routerLink]="['/components', p.name]" class="group flex flex-col gap-1 rounded-md p-2 -m-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span class="text-sm text-muted-foreground">Previous</span>
              <span class="font-medium group-hover:underline group-hover:underline-offset-4"><span aria-hidden="true">← </span>{{ p.title }}</span>
            </a>
          } @else { <span></span> }
          @if (next(); as n) {
            <a [routerLink]="['/components', n.name]" class="group flex flex-col items-end gap-1 rounded-md p-2 -m-2 text-right outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span class="text-sm text-muted-foreground">Next</span>
              <span class="font-medium group-hover:underline group-hover:underline-offset-4">{{ n.title }}<span aria-hidden="true"> →</span></span>
            </a>
          }
        </nav>
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
  private readonly index = computed(() => DOCS.findIndex((d) => d.name === this.name()));
  protected readonly prev = computed(() => DOCS[this.index() - 1]);
  protected readonly next = computed(() => (this.index() < 0 ? undefined : DOCS[this.index() + 1]));
  protected readonly tab = linkedSignal<string, string | undefined>({ source: this.name, computation: () => 'preview' });
  protected readonly files = resource({ params: () => this.doc(), loader: ({ params }) => params.load() });
  protected readonly sized = computed(() => SIZED.has(this.name()));
  protected readonly sizes = resource({ params: () => this.sized() || undefined, loader: () => import('../demos/sizes').then((m) => m.Sizes) });
  protected readonly axeVersion = axe.version;
  protected readonly testing = computed(() => {
    const doc = this.doc();
    const file = (registry.items as Record<string, { testing?: string[] }>)[doc?.name ?? '']?.testing?.[0];
    if (!doc?.harness || !file) return undefined;
    const name = file.split('/').pop()!;
    // Dialogs and toasts render in a global overlay: their harness loads from the document root.
    const loader = ROOT_HARNESSES.includes(doc.harness) ? 'documentRootLoader' : 'loader';
    const variable = doc.harness.slice(2, 3).toLowerCase() + doc.harness.slice(3, -'Harness'.length);
    const usage = [
      "import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';",
      `import { ${doc.harness} } from './ui/${name.replace(/\.ts$/, '')}';`,
      '',
      `const ${variable} = await TestbedHarnessEnvironment.${loader}(fixture).getHarness(${doc.harness});`,
    ].join('\n');
    const repo = cli.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
    return { harness: doc.harness, file: name, usage, url: `${repo}/blob/main/registry/${file}` };
  });
  /** Roles and aria-* attributes seen in the live demo (the lists grow as it is used). */
  // equal: only a real change re-renders. A render can rewrite the same attributes (fzField does,
  // after every render), which the observer sees: without this the two would loop forever.
  protected readonly aria = signal<{ roles: string[]; attributes: string[] }>(
    { roles: [], attributes: [] },
    { equal: (a, b) => a.roles.join() === b.roles.join() && a.attributes.join() === b.attributes.join() },
  );
  private readonly demoHost = viewChild<ElementRef<HTMLElement>>('demoHost');

  constructor() {
    effect((onCleanup) => {
      const host = this.demoHost()?.nativeElement;
      this.name(); // a new component starts a new list
      if (!host || typeof MutationObserver === 'undefined') return; // no DOM observers when prerendering
      const roles = new Set<string>();
      const attributes = new Set<string>();
      const scan = () => {
        for (const el of host.querySelectorAll('*')) {
          for (const r of el.getAttribute('role')?.split(' ') ?? []) if (r) roles.add(r);
          for (const a of el.getAttributeNames()) if (a.startsWith('aria-')) attributes.add(a);
        }
        this.aria.set({ roles: [...roles].sort(), attributes: [...attributes].sort() });
      };
      const observer = new MutationObserver(scan);
      observer.observe(host, { subtree: true, childList: true, attributes: true });
      scan();
      onCleanup(() => observer.disconnect());
    });
  }

  // Show the demo the way a user writes it: `add` puts the files in ./ui next to their component.
  protected readonly usage = computed(() => this.files.hasValue() ? this.files.value()[1].replaceAll('../../../registry/ui/', './ui/') : '');
}
