import { Component } from '@angular/core';
import { CodeBlock } from '../code-block';

@Component({
  imports: [CodeBlock],
  template: `
    <article class="flex max-w-2xl flex-col gap-6">
      <h1 class="text-3xl font-bold tracking-tight">Installation</h1>
      <p class="text-lg text-muted-foreground">Set up an Angular app once, then add components one by one.</p>

      <p class="rounded-md border px-4 py-3 text-sm">
        <strong>Not on npm yet.</strong> Until the CLI is published, clone the repository and run
        <code class="rounded bg-muted px-1">node &lt;clone&gt;/cli/index.mjs</code> where these pages say
        <code class="rounded bg-muted px-1">npx fizzy-ui</code>.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Requirements</h2>
      <p>An Angular 22 app (standalone components; zoneless works). The components are tested with &#64;angular/aria 22.3.</p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">1. Initialize</h2>
      <p>Run this in the project root:</p>
      <app-code-block code="npx fizzy-ui init" label="init command" />
      <ul class="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
        <li>writes the theme tokens to <code class="rounded bg-muted px-1">src/fizzy.css</code>;</li>
        <li>imports Tailwind and the theme at the top of <code class="rounded bg-muted px-1">src/styles.css</code>;</li>
        <li>creates <code class="rounded bg-muted px-1">.postcssrc.json</code> and installs tailwindcss, &#64;tailwindcss/postcss and postcss.</li>
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">2. Add components</h2>
      <app-code-block code="npx fizzy-ui add button tabs dialog" label="add command" />
      <p class="text-sm text-muted-foreground">
        Files go to <code class="rounded bg-muted px-1">src/app/ui/</code>, and missing dependencies (&#64;angular/aria,
        &#64;angular/cdk) are installed. Existing files are never overwritten unless you pass
        <code class="rounded bg-muted px-1">--overwrite</code>. <code class="rounded bg-muted px-1">npx fizzy-ui list</code> prints every name.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">3. Use them</h2>
      <app-code-block [code]="usage" label="usage example" />

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Customizing</h2>
      <p>
        The files are yours: to change a component everywhere, edit it in <code class="rounded bg-muted px-1">src/app/ui/</code>.
        For one use, add classes on the element; they join the component's own.
      </p>
      <p>
        To override something the component already sets, such as its width, add <code class="rounded bg-muted px-1">!</code>:
        <code class="rounded bg-muted px-1">&lt;fz-select class="w-56!"&gt;</code>. Without it, which of two classes for the same
        property wins depends on Tailwind's CSS order, not on yours (<code class="rounded bg-muted px-1">w-full</code> beats
        <code class="rounded bg-muted px-1">w-56</code>).
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Options</h2>
      <div class="overflow-x-auto rounded-md border">
        <table class="w-full text-sm">
          <thead class="bg-muted/50 text-left">
            <tr><th scope="col" class="px-4 py-2 font-medium">Flag</th><th scope="col" class="px-4 py-2 font-medium">Effect</th></tr>
          </thead>
          <tbody>
            @for (row of options; track row[0]) {
              <tr class="border-t">
                <td class="whitespace-nowrap px-4 py-2 font-mono text-xs">{{ row[0] }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row[1] }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
})
export class InstallationPage {
  protected readonly usage = [
    "import { Component } from '@angular/core';",
    "import { FZ_BUTTON } from './ui/button';",
    '',
    '@Component({',
    "  selector: 'app-root',",
    '  imports: [FZ_BUTTON],',
    "  template: '<button fzButton variant=\"outline\">Click me</button>',",
    '})',
    'export class App {}',
  ].join('\n');
  protected readonly options = [
    ['--path <dir>', 'Where add writes files (default src/app/ui)'],
    ['--overwrite', 'Replace files that already exist'],
    ['--skip-install', 'Do not install npm dependencies'],
    ['--registry <dir|url>', 'Read components from another registry'],
  ];
}
