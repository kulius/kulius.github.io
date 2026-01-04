import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).default([]),
			category: z.enum(['odoo', 'ai', 'digital-transformation', 'other']).default('other'),
			source: z.enum(['github', 'rss', 'manual']).default('manual'),
			sourceUrl: z.string().url().optional(),
			author: z.string().default('蘇勃任'),
		}),
});

export const collections = { blog };
