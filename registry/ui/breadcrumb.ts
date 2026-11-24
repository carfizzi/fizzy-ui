import { Directive, input } from '@angular/core';

/**
 * Where the page sits: `<nav fzBreadcrumb><ol><li><a href="/">Home</a></li>…<li><span aria-current="page">Here</span></li></ol></nav>`.
 * A `nav` labelled "Breadcrumb". Separators are drawn in CSS, so screen readers skip them.
 * Mark the current page with `aria-current="page"`.
 */
@Directive({
  selector: 'nav[fzBreadcrumb]',
  host: {
    '[attr.aria-label]': 'label()',
    class:
      '[&_ol]:flex [&_ol]:flex-wrap [&_ol]:items-center [&_ol]:gap-2 [&_ol]:text-sm [&_ol]:text-muted-foreground ' +
      '[&_li]:inline-flex [&_li]:items-center [&_li]:gap-2 ' +
      // a chevron from two borders: no text for screen readers to read
      "[&_li+li]:before:size-1.5 [&_li+li]:before:rotate-45 [&_li+li]:before:border-t [&_li+li]:before:border-r [&_li+li]:before:border-current [&_li+li]:before:content-[''] rtl:[&_li+li]:before:-rotate-135 " +
      '[&_a]:rounded-sm [&_a]:transition-colors [&_a]:outline-none [&_a:hover]:text-foreground [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring ' +
      '[&_[aria-current=page]]:text-foreground',
  },
})
export class FzBreadcrumb {
  readonly label = input('Breadcrumb', { alias: 'aria-label' });
}

export const FZ_BREADCRUMB = [FzBreadcrumb] as const;
