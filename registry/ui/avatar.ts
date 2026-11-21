import { Component, input, linkedSignal } from '@angular/core';

/**
 * Shows `src` once it has loaded; until then, or if it fails, shows `fallback` (e.g. initials).
 * Use `alt=""` when a visible name sits next to the avatar.
 */
@Component({
  selector: 'fz-avatar',
  host: { class: 'relative flex size-8 shrink-0 overflow-hidden rounded-full' },
  template: `
    @if (src() && status() !== 'error') {
      <img
        [src]="src()"
        [alt]="alt()"
        (load)="status.set('loaded')"
        (error)="status.set('error')"
        class="aspect-square size-full object-cover"
        [class.hidden]="status() !== 'loaded'"
      />
    }
    @if (status() !== 'loaded') {
      <span
        [attr.role]="alt() ? 'img' : null"
        [attr.aria-label]="alt() || null"
        [attr.aria-hidden]="alt() ? null : 'true'"
        class="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground"
      >
        {{ fallback() }}
      </span>
    }
  `,
})
export class FzAvatar {
  readonly src = input<string>();
  readonly alt = input.required<string>();
  readonly fallback = input('');
  // A new src starts loading again.
  protected readonly status = linkedSignal<string | undefined, 'loading' | 'loaded' | 'error'>({
    source: this.src,
    computation: () => 'loading',
  });
}

export const FZ_AVATAR = [FzAvatar] as const;
