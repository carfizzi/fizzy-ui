import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { CopyButton } from '../copy-button';
import { Logo } from '../logo';

@Component({
  imports: [RouterLink, FZ_BUTTON, CopyButton, Logo],
  styles: `
    @keyframes rise {
      from { translate: 0 6rem; opacity: 0; }
      20%, 70% { opacity: 1; }
      to { translate: 0 -10rem; opacity: 0; }
    }
    /* Reduce Motion: the bubbles stay where they are. */
    @media (prefers-reduced-motion: no-preference) {
      .bubble { animation: rise var(--t) linear var(--delay) infinite backwards; }
    }
  `,
  template: `
    <section class="relative isolate mb-12 overflow-hidden rounded-xl border bg-muted/40 px-6 py-12 sm:px-10 sm:py-16">
      <div aria-hidden="true" class="absolute inset-y-0 right-0 -z-10 w-1/2">
        @for (b of bubbles; track $index) {
          <span class="bubble absolute rounded-full border-2 border-foreground/10 bg-foreground/[0.03]"
            [style.left.%]="b[0]" [style.top.%]="b[1]" [style.width.rem]="b[2]" [style.height.rem]="b[2]"
            [style.--t]="b[3] + 's'" [style.--delay]="-b[4] + 's'"></span>
        }
      </div>
      <app-logo class="size-14" />
      <h1 class="mt-6 max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">Accessible Angular components you own.</h1>
      <p class="mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
        Behavior from &#64;angular/aria, styles from Tailwind v4. The CLI copies each component's source into your app, and from
        then on it is your code.
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <a fzButton routerLink="/installation">Get started</a>
        <a fzButton variant="outline" routerLink="/components/button">Browse components</a>
        <div class="flex items-center gap-2 rounded-md border bg-background py-0.5 pl-3 pr-0.5 font-mono text-sm">
          <span aria-hidden="true" class="text-muted-foreground">$ </span><code>npx fizzy-ui init</code>
          <app-copy-button text="npx fizzy-ui init" label="Copy install command" />
        </div>
      </div>
    </section>

    <article class="flex max-w-2xl flex-col gap-6">
      <h2 class="text-xl font-semibold tracking-tight">Introduction</h2>
      <p>
        fizzy-ui follows the shadcn/ui model. It is not a dependency you install and wrap: the CLI copies each component's
        source into your project, and from then on it is your code. Change the markup, the classes or the API as you like.
      </p>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">How it is built</h2>
      <ul class="list-disc space-y-2 pl-6">
        <li>
          <strong>Behavior from &#64;angular/aria.</strong> Keyboard navigation, focus management and ARIA come from Angular's own
          accessibility primitives, so fizzy-ui does not reimplement them.
        </li>
        <li><strong>Overlays from &#64;angular/cdk.</strong> Menus, selects, popovers, tooltips and dialogs use CDK overlays and the CDK dialog.</li>
        <li>
          <strong>Styles with Tailwind CSS v4 and CSS variables.</strong> Components only use theme tokens such as
          <code class="rounded bg-muted px-1">bg-primary</code>, so light, dark and your brand colors come from one file.
        </li>
        <li><strong>Native where the platform is enough.</strong> Checkbox, switch, radio and slider are styled native inputs, so forms and labels keep working.</li>
        <li><strong>One file per component</strong>, importing only <code class="rounded bg-muted px-1">&#64;angular/*</code>.</li>
      </ul>

      <h2 class="mt-4 text-xl font-semibold tracking-tight">Tested</h2>
      <p>
        Each component has unit tests for its keyboard and ARIA behavior, and every example on this site is checked with axe-core.
      </p>
    </article>
  `,
})
export class IntroductionPage {
  /** Decorative fizz: [left %, top %, size rem, rise seconds, phase seconds]. */
  protected readonly bubbles = [
    [70, 70, 3.5, 9, 0], [40, 55, 1.5, 7, 2], [85, 30, 1, 6, 4], [55, 85, 2.25, 8, 5],
    [20, 75, 0.75, 5, 1], [75, 10, 1.75, 10, 6], [30, 25, 1, 7, 3.5], [90, 80, 0.75, 6, 2.5],
  ];
}
