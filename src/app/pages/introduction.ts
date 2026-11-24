import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FZ_BUTTON } from '../../../registry/ui/button';
import { FZ_CARD } from '../../../registry/ui/card';
import { FZ_SWITCH } from '../../../registry/ui/switch';
import { FZ_SLIDER } from '../../../registry/ui/slider';
import { FZ_TABS } from '../../../registry/ui/tabs';
import { CopyButton } from '../copy-button';

@Component({
  imports: [RouterLink, FZ_BUTTON, FZ_CARD, FZ_SWITCH, FZ_SLIDER, FZ_TABS, CopyButton],
  styles: `
    /* Apple-style entrance: rise out of a slight blur on the theme spring, one element after the other. */
    @keyframes reveal { from { opacity: 0; translate: 0 0.75rem; filter: blur(6px); } }
    @media (prefers-reduced-motion: reduce) {
      @keyframes reveal { from { opacity: 0; } }
    }
    .reveal { animation: reveal var(--fz-duration-panel) var(--fz-spring) calc(var(--i) * 70ms) backwards; }
  `,
  template: `
    <section class="pb-14 pt-4 md:pt-10">
      <h1 class="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl">
        <!-- The space stays inside the text: Angular drops whitespace-only nodes. -->
        <span class="reveal block" style="--i: 0">Accessible Angular components. </span>
        <span class="reveal block text-muted-foreground" style="--i: 1">Yours to own.</span>
      </h1>
      <p class="reveal mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl" style="--i: 2">
        Behavior from &#64;angular/aria, styles from Tailwind v4. The CLI copies each component's source into your app, and from
        then on it is your code.
      </p>
      <div class="reveal mt-8 flex flex-wrap items-center gap-3" style="--i: 3">
        <a fzButton routerLink="/installation">Get started</a>
        <a fzButton variant="outline" routerLink="/components/button">Browse components</a>
        <div class="flex h-(--fz-h) items-center gap-3 rounded-md border bg-muted/50 pl-3.5 pr-0.5 font-mono text-sm">
          <code><span aria-hidden="true" class="select-none text-muted-foreground">$ </span>npx fizzy-ui init</code>
          <app-copy-button icon text="npx fizzy-ui init" label="Copy install command" />
        </div>
      </div>
    </section>

    <section aria-label="Live example" class="mb-16 grid gap-4 md:grid-cols-5">
      <div fzCard class="reveal md:col-span-3" style="--i: 5">
        <div fzCardHeader>
          <h2 fzCardTitle>Notifications</h2>
          <p fzCardDescription>Choose what reaches you, and how loud.</p>
        </div>
        <div fzCardContent class="flex flex-col gap-5 text-sm">
          <label class="flex items-center justify-between gap-4">Mentions <input type="checkbox" fzSwitch checked /></label>
          <label class="flex items-center justify-between gap-4">Weekly digest <input type="checkbox" fzSwitch /></label>
          <div class="flex flex-col gap-3">
            <label for="hero-volume" class="flex justify-between">Volume <span class="text-muted-foreground">{{ volume() }}%</span></label>
            <input id="hero-volume" type="range" fzSlider min="0" max="100" [value]="volume()" (input)="volume.set(+$any($event.target).value)" />
          </div>
        </div>
      </div>
      <div fzCard class="reveal md:col-span-2" style="--i: 6">
        <div fzCardHeader>
          <h2 fzCardTitle>Appearance</h2>
          <p fzCardDescription>Every key and role from &#64;angular/aria.</p>
        </div>
        <div fzCardContent fzTabs>
          <ul fzTabList [(selectedTab)]="theme">
            <li fzTab value="light">Light</li>
            <li fzTab value="dark">Dark</li>
            <li fzTab value="auto">Auto</li>
          </ul>
          <div fzTabPanel value="light" class="pt-4 text-sm text-muted-foreground"><ng-template ngTabContent>Always light.</ng-template></div>
          <div fzTabPanel value="dark" class="pt-4 text-sm text-muted-foreground"><ng-template ngTabContent>Always dark.</ng-template></div>
          <div fzTabPanel value="auto" class="pt-4 text-sm text-muted-foreground"><ng-template ngTabContent>Follows your system.</ng-template></div>
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
  protected readonly volume = signal(60);
  protected readonly theme = signal('auto');
}
