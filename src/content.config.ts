import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 定义 blog 集合, 使用 glob 自动扫描 src/content/blog 下的所有 md 文件
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog };