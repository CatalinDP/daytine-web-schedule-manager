import type { Meta, StoryObj } from '@storybook/angular-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import { ColorPicker } from './color-picker';
import { EN } from '../mocks/strings.en';
import { ES } from '../mocks/strings.es';
import { TAG_IDS, TagId } from '../data/tag.model';

// `satisfies` fails the build if a strings file misses a color or adds an unknown one.
const EN_NAMES = EN.colors satisfies Record<TagId, string>;
const ES_NAMES = ES.colors satisfies Record<TagId, string>;
const LEGEND = EN.sheet.color;

const meta: Meta<ColorPicker> = {
  title: 'Design/ColorPicker',
  component: ColorPicker,
  argTypes: {
    selected: { control: 'select', options: TAG_IDS },
  },
  args: {
    legend: LEGEND,
    selected: 'slate',
    names: EN_NAMES,
    selectedChange: fn(),
  },
  // Acts like a real parent: the picker only emits, and the story feeds the new id back in.
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return {
      props: {
        ...args,
        selectedChange: (id: TagId) => {
          args.selectedChange?.(id);
          updateArgs({ selected: id });
        },
      },
    };
  },
};

export default meta;
type Story = StoryObj<ColorPicker>;

export const Default: Story = {
  args: { selected: 'amber' },
};

export const Spanish: Story = {
  args: { names: ES_NAMES },
};

export const Selected: Story = {
  args: { selected: 'purple' },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
