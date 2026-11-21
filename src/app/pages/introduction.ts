import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FZ_BUTTON } from '../../../registry/ui/button';

@Component({
  imports: [RouterLink, FZ_BUTTON],
  template: `
    <article class="flex max-w-2xl flex-col gap-6">
      <h1 class="text-3xl font-bold tracking-tight">Introduction</h1>
      <p class="text-lg text-muted-foreground">
        Accessible, styled Angular components that you copy into your app and own.
      </p>
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

      <div class="flex flex-wrap gap-2">
        <a fzButton routerLink="/installation">Get started</a>
        <a fzButton variant="outline" routerLink="/components/button">Browse components</a>
      </div>
    </article>
  `,
})
export class IntroductionPage {}
