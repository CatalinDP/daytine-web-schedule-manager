import { TagId } from '../data/tag.model';

export const TAG_STYLES = {
  blue: { swatch: 'bg-task-blue', onSwatch: 'text-on-task-blue' },
  green: { swatch: 'bg-task-green', onSwatch: 'text-on-task-green' },
  amber: { swatch: 'bg-task-amber', onSwatch: 'text-on-task-amber' },
  red: { swatch: 'bg-task-red', onSwatch: 'text-on-task-red' },
  purple: { swatch: 'bg-task-purple', onSwatch: 'text-on-task-purple' },
  pink: { swatch: 'bg-task-pink', onSwatch: 'text-on-task-pink' },
  teal: { swatch: 'bg-task-teal', onSwatch: 'text-on-task-teal' },
  slate: { swatch: 'bg-task-slate', onSwatch: 'text-on-task-slate' },
} as const satisfies Record<TagId, TagStyle>;

export interface TagStyle {
  readonly swatch: string;
  readonly onSwatch: string;
}
