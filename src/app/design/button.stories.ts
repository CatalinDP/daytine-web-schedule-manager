import type { Meta, StoryObj } from '@storybook/angular-vite';

import { Button } from './button';

const meta: Meta<Button> = {
  title: 'Design/Button',
  component: Button,
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tonal', 'text'] },
    tone: { control: 'inline-radio', options: ['primary', 'error', 'tertiary', 'inherit'] },
  },
  args: { variant: 'filled', tone: 'primary' },
  // Attribute selector component, so the story needs its own host element.
  render: (args) => ({
    props: args,
    template: `<button dt-button type="button" [variant]="variant" [tone]="tone">Save</button>`,
  }),
};

export default meta;
type Story = StoryObj<Button>;

export const Filled: Story = {};
export const Tonal: Story = { args: { variant: 'tonal' } };
export const TextError: Story = { args: { variant: 'text', tone: 'error' } };
