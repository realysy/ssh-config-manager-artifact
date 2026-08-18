/** src/content.config.ts
 * Astro 内容集合 (Content Collections) 的配置文件
 */

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // 使用 glob loader (Astro 3.0+), 可自定义扫描位置
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),

  // 定义 Blog markdown 文件的前置元数据 Front Matter 的 Schema
  schema: z.object({
    title: z.string(),                        // 必需: 标题
    pubDate: z.coerce.date(),                 // 发布日期, 自动将字符串转为 Date
    updatedDate: z.coerce.date().optional(),  // 更新日期
    description: z.string().optional(),       // 摘要
    tags: z.array(z.string()).optional(),     // 标签
    category: z.string().optional(),          // 分类
    image: z.string().optional(),             // 配图路径
    author: z.string().optional(),            // 作者
    draft: z.boolean().optional().default(false),  // 是否草稿, 草稿不会显示在网站
    minutesRead: z.number().optional(),       // 自定义: 阅读时间
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),                        // 必需: 标题
    order: z.number().optional(),             // 用于控制同级文档的排序, 数字越小越靠前
    pubDate: z.coerce.date().optional(),      // 发布日期, 自动将字符串转为 Date
    updatedDate: z.coerce.date().optional(),  // 更新日期
    description: z.string().optional(),       // 摘要
    image: z.string().optional(),             // 配图路径
    minutesRead: z.number().optional(),       // 自定义: 阅读时间
    category: z.boolean().optional().default(false),  // 标识该文件是否为分类配置文件
  }),
});

// 声明内容集合 - 告诉 Astro 存在叫 blog, docs 的集合
export const collections = { blog, docs };