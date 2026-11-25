import type { Meta, StoryObj } from '@storybook/angular-vite';

import { Icon } from './icon';

const meta: Meta<Icon> = {
  title: 'Design/Icon',
  component: Icon,
  args: { name: 'check', size: 24 },
};

export default meta;
type Story = StoryObj<Icon>;

export const Default: Story = {};
export const Large: Story = { args: { name: 'moon_stars', size: 48 } };
