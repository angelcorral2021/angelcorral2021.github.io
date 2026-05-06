import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writeups = defineCollection({
  loader: glob({ base: './src/content/writeups', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()).default([]),
    ip: z.string().optional(),
    domain: z.string().optional(),
    platform: z.string().optional(),
    image: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.string(),
    status: z.string().default('completed'),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).optional(),
  }),
});

const apuntes = defineCollection({
  loader: glob({ base: './src/content/apuntes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).optional(),
  }),
});

export const collections = {
  writeups,
  projects,
  apuntes
};
