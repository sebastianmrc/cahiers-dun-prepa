// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      weights: [600, 700],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Sans 3',
      cssVariable: '--font-sans',
      weights: [400, 600],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});