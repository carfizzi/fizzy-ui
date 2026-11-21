import { Directive } from '@angular/core';

/** Dims when its control is disabled: the control is inside the label or right after it. */
@Directive({
  selector: 'label[fzLabel]',
  host: {
    class: 'flex select-none items-center gap-2 text-sm font-medium leading-none [&:has(:disabled,+:disabled)]:cursor-not-allowed [&:has(:disabled,+:disabled)]:opacity-50',
  },
})
export class FzLabel {}

export const FZ_LABEL = [FzLabel] as const;
