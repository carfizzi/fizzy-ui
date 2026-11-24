import { Component } from '@angular/core';
import { FZ_BREADCRUMB } from '../../../registry/ui/breadcrumb';

@Component({
  imports: [FZ_BREADCRUMB],
  template: `
    <nav fzBreadcrumb>
      <ol>
        <li><a href="introduction">Home</a></li>
        <li><a href="components/accordion">Components</a></li>
        <li><span aria-current="page">Breadcrumb</span></li>
      </ol>
    </nav>
  `,
})
export class Demo {}
