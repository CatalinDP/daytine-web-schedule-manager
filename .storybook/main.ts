import { readFile } from 'node:fs/promises';

import type { StorybookConfig } from '@storybook/angular-vite';
import type { Plugin } from 'vite';

// The app build loads .svg as text (angular.json `loader`); Vite would return a URL instead.
function svgAsText(): Plugin {
  return {
    name: 'dt-svg-as-text',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('.svg')) return null;
      const svg = await readFile(id, 'utf8');
      return `export default ${JSON.stringify(svg)};`;
    },
  };
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/angular-vite',
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [...(viteConfig.plugins ?? []), svgAsText()],
  }),
};

export default config;
