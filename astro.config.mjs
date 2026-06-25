import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 替换为您的实际 GitHub Pages URL, eg: https://realysy.github.io or 自定义域名站点地址
  site: 'https://smgr.real.abrdns.com/', 
  // 如果是项目主页非 username.github.io, 必须加上仓库名作为 base
  base: '/', 
  integrations: [
    sitemap({
      // 过滤掉不需要收录的页面 (如果有的话)
      filter: (page) => !page.includes('/404'),
      // 自定义多语言 URL 生成 (可选，插件会自动处理大部分)
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN',
        },
      },
    }),
  ],
});