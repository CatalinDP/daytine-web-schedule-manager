import type { Decorator, Preview } from '@storybook/angular-vite';

type ThemeGlobal = 'system' | 'light' | 'dark';

// Mirrors ThemeService: no attribute means "follow the OS".
const withTheme: Decorator = (story, context) => {
  const theme = context.globals['theme'] as ThemeGlobal;
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  return story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'system' },
  parameters: {
    // App surfaces come from CSS tokens, so the addon's own backgrounds would clash with the theme.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' shows violations in the a11y panel without failing anything.
      test: 'todo',
    },
  },
};

export default preview;
