import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    { provider: fontProviders.google(), name: 'Source Serif 4', cssVariable: '--font-serif' },
    { provider: fontProviders.google(), name: 'Source Sans 3',  cssVariable: '--font-sans'  },
  ],
});