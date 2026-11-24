import { RenderMode, ServerRoute } from '@angular/ssr';
import { DOCS } from './docs';

// Every page is prerendered to its own HTML file: one per guide and one per component.
export const serverRoutes: ServerRoute[] = [
  { path: 'components/:name', renderMode: RenderMode.Prerender, getPrerenderParams: async () => DOCS.map((d) => ({ name: d.name })) },
  { path: '**', renderMode: RenderMode.Prerender },
];
