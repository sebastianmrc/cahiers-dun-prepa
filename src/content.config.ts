import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { FONCTION_IDS } from './data/fonctions';

const DOMAINES_SI = [
  'modelisation-asservissements',
  'mecanique-solides-mecanismes',
  'rdm-structures',
  'conception-specifications',
  'materiaux-procedes',
  'fabrication-industrialisation',
  'mesures-validation',
] as const;

const polys = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/polys',
  }),
  schema: z.object({
    titre: z.string(),
    matiere: z.enum(['maths', 'physique', 'si']),
    annee: z.enum(['ptsi', 'pt']),
    type: z.enum(['cours', 'synthese']).default('cours'),
    ordre: z.number(),
    pdf: z.string(),
    maj: z.coerce.date(),
    fonctions: z.array(z.enum(FONCTION_IDS)).default([]),
    domainesSi: z.array(z.enum(DOMAINES_SI)).default([]),
    resume: z.string().optional(),
  }),
});

export const collections = { polys };
