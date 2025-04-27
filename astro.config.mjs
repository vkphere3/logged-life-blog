import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] }]
    ],
    remarkPlugins: [remarkGfm]
  }
});