import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const polys = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/polys',
  }),
schema: z.object({
  titre: z.string(),
  matiere: z.enum(['maths', 'physique', 'si']),
  annee: z.enum(['ptsi', 'pt']),     // ← la nouvelle ligne
  ordre: z.number(),
  pdf: z.string(),
  maj: z.coerce.date(),
}),
});

export const collections = { polys };