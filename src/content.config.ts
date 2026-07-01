/** src/content.config.ts
 * Astro 内容集合 (Content Collections) 的配置文件
 */

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // 使用 glob loader (Astro 3.0+), 可自定义扫描位置
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),

  // 定义 Blog markdown 文件的前置元数据 Front Matter 的 Schema
  schema: z.object({
    title: z.string(),                        // 必需: 标题
    pubDate: z.coerce.date(),                 // 自动将字符串转为 Date                      // 发布日期（常用名）
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

// 声明内容集合 - 告诉 Astro 存在一个叫 blog 的集合
export const collections = { blog };