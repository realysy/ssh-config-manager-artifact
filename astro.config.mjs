// astro.config.mjs

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; 
import compress from 'astro-compress'; 

// 提取 base 配置，方便后续在 serialize 中复用
const SITE_BASE = '/ssh-config-manager-artifact';
const cwd = process.cwd();

const blogDir = path.join(cwd, 'src/content/blog');
const blogGitTimeMap = new Map();

// 🌟 核心修复：对路径的每一段分别 slugify，与 Astro 的 URL 生成逻辑完美对齐
// 例如: 'zh/2026/06/Github Action for CI CD' → 'zh/2026/06/github-action-for-ci-cd'
// 例如: '2026/07/v1.1.0-released-with-...' → '2026/07/v110-released-with-...'
function slugifyPath(filePath) {
  return filePath.split('/').map(segment => {
    return segment.toString().toLowerCase()
      .replace(/\.mdx?$/, '')      // 移除 .md/.mdx 后缀
      .replace(/\s+/g, '-')        // 空格变连字符
      .replace(/[^\w\-]+/g, '')    // 移除非字母数字和连字符的字符 (如点号)
      .replace(/\-\-+/g, '-')      // 合并连续连字符
      .replace(/^-+/, '')          // 移除开头连字符
      .replace(/-+$/, '');         // 移除结尾连字符
  }).join('/');
}

function getMdFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getMdFiles(fullPath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(fullPath);
    }
  });
  return results;
}

async function initBlogGitTimes() {
  const mdFiles = getMdFiles(blogDir);
  console.log(`[Sitemap] 🚀 开始扫描 ${mdFiles.length} 篇博客...`);
  
  for (const fullPath of mdFiles) {
    const relativePath = path.relative(cwd, fullPath).split(path.sep).join('/');
    // 🌟 核心优化：提取相对于 blogDir 的路径，并通过 slugifyPath 与 Astro URL 生成逻辑对齐
    // 这样 'Github Action for CI CD.md' → 'github-action-for-ci-cd'，与 Sitemap 中的 URL slug 完美咬合
    const rawRelativePath = path.relative(blogDir, fullPath).split(path.sep).join('/');
    const mapKey = slugifyPath(rawRelativePath);

    try {
      // 使用原生 execSync，并强制指定 cwd，捕获所有输出
      const gitDate = execSync(
        `git log -1 --format=%cI -- "${relativePath}"`, 
        { encoding: 'utf-8', cwd: cwd, stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (gitDate) {
        blogGitTimeMap.set(mapKey, new Date(gitDate));
        console.log(`[Sitemap] ✅ Git 成功: ${relativePath}`);
      } else {
        throw new Error('Git 返回为空');
      }
    } catch (e) {
      // 🎯 核心诊断：打印出 Git 的真实报错信息
      const errMsg = e.stderr ? e.stderr.toString().trim() : e.message;
      console.warn(`[Sitemap] ❌ Git 失败: ${relativePath}`);
      console.warn(`   └─ 原因: ${errMsg}`);
      
      // 兜底：使用文件系统的最后修改时间 (mtime)
      const stat = fs.statSync(fullPath);
      blogGitTimeMap.set(mapKey, stat.mtime);
    }
  }
  console.log(`[Sitemap] 🏁 扫描完成，共生成 ${blogGitTimeMap.size} 个精准时间戳。`);
}

await initBlogGitTimes();

// 获取静态页面 (.astro) 或任意文件的 Git 时间 (统一使用 execSync 替代未导入的 gitlog)
function getStaticPageGitDate(targetPath) {
  if (!targetPath || !fs.existsSync(targetPath)) return null;
  const relativePath = path.relative(cwd, targetPath).split(path.sep).join('/');
  try {
    const gitDate = execSync(
      `git log -1 --format=%cI -- "${relativePath}"`,
      { encoding: 'utf-8', cwd: cwd, stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    
    if (gitDate) {
      return new Date(gitDate);
    }
    return fs.statSync(targetPath).mtime; // 兜底：使用文件系统的最后修改时间
  } catch (e) {
    return fs.statSync(targetPath).mtime; // 兜底
  }
}

// 🚀 新增：获取多个文件中最晚的 Git 修改时间
function getMaxGitDate(filePaths) {
  let maxDate = null;
  for (const targetPath of filePaths) {
    const date = getStaticPageGitDate(targetPath);
    if (date) {
      if (!maxDate || date > maxDate) {
        maxDate = date;
      }
    }
  }
  return maxDate;
}

// 🚀 新增：获取多个日期中最晚的一个
function getLatestDate(...dates) {
  let max = null;
  for (const d of dates) {
    if (d && (!max || d > max)) max = d;
  }
  return max;
}

// 🚀 核心优化：计算全局及特定页面依赖组件的最新修改时间
// 1. 全局依赖 (影响所有页面: 布局、全局样式、脚本、页眉页脚)
const globalDeps = [
  'src/layouts/Layout.astro',
  'src/styles/global.css',
  'src/scripts/main.js',
  'src/components/Header.astro',
  'src/components/Footer.astro',
  'astro.config.mjs',
];
const globalMaxDate = getMaxGitDate(globalDeps.map(p => path.join(cwd, p)));

// 2. 主页特定依赖
const homeDeps = [
  'src/components/FAQs.astro',
  'src/components/PricingCards.astro',
];
const homeMaxDate = getMaxGitDate(homeDeps.map(p => path.join(cwd, p)));

// 3. 博客列表页特定依赖
const blogListDeps = [
  'src/components/BlogCard.astro',
  'src/utils/extractTags.ts',
  'src/components/BlogListStyles.astro',
];
const blogListMaxDate = getMaxGitDate(blogListDeps.map(p => path.join(cwd, p)));

// 🌟 4. 博客详情页依赖 (极致精细化：中英文模板分离)
const enBlogPostDeps = ['src/pages/blog/[...slug].astro', 'src/components/Giscus.astro'];
const enBlogPostMaxDate = getMaxGitDate(enBlogPostDeps.map(p => path.join(cwd, p)));

const zhBlogPostDeps = ['src/pages/zh/blog/[...slug].astro', 'src/components/Giscus.astro'];
const zhBlogPostMaxDate = getMaxGitDate(zhBlogPostDeps.map(p => path.join(cwd, p)));

console.log(`[Sitemap] 🕒 依赖时间戳计算完成: 全局(${globalMaxDate?.toISOString()}), 主页(${homeMaxDate?.toISOString()}), 列表(${blogListMaxDate?.toISOString()}), 详情(${zhBlogPostMaxDate?.toISOString()})`);


// 🛡️ 自定义 Astro 集成: 在构建完成后清理所有 HTML 文件中的注释
function removeHtmlComments() {
  return {
    name: 'remove-html-comments',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // dir 是一个 URL 对象, 需要转换为本地文件系统路径
        const outDir = fileURLToPath(dir);
        let cleanedCount = 0;

        // 递归遍历 dist 目录
        const processDir = (currentDir) => {
          const files = fs.readdirSync(currentDir);
          for (const file of files) {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              processDir(fullPath);
            } else if (file.endsWith('.html')) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              // 正则匹配并移除 HTML 注释 (包含换行)
              const newContent = content.replace(/<!--[\s\S]*?-->/g, '');
              
              // 只有内容发生改变时才写回磁盘, 减少不必要的 I/O
              if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf-8');
                cleanedCount++;
              }
            }
          }
        };

        processDir(outDir);
        console.log(`[remove-html-comments] 🧹 清理完成, 共处理 ${cleanedCount} 个 HTML 文件.`);
      }
    }
  };
}


// https://astro.build/config
export default defineConfig({
  // 替换为您的实际 GitHub Pages URL, eg: https://realysy.github.io or 自定义域名站点地址
  site: 'https://www.mctek.site/', 
  // 如果是项目主页非 username.github.io 且未绑定自定义域名, 必须加上仓库名作为 base
  base: SITE_BASE, 

  integrations: [
    sitemap({
      // 过滤掉不需要收录的页面 (如果有的话)
      filter: (page) => !page.includes('/404'),
      // 自定义多语言 URL 生成 (可选，插件会自动处理大部分)
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', zh: 'zh-CN' },
      },
      async serialize(item) {
        const url = item.url;
        
        // A. 匹配博客详情页 (正则兼容完整 URL)
        // 🌟 核心优化：修改正则，捕获组 1 为语言前缀 ('zh/' 或 undefined)，捕获组 2 为 slug
        const blogMatch = url.match(/\/(zh\/)?blog\/(.+)\/$/);
        if (blogMatch) {
          const langPrefix = blogMatch[1] || ''; // 'zh/' 或 ''
          const slug = blogMatch[2]; // '2026/05/...'
          
          // 拼接出与 initBlogGitTimes 中完全一致的 Map Key
          const mapKey = `${langPrefix}${slug}`;
          const postDate = blogGitTimeMap.get(mapKey);
          
          // 🌟 极致精细化：根据语言前缀，精准选择对应的模板依赖时间
          const templateDate = langPrefix === 'zh/' ? zhBlogPostMaxDate : enBlogPostMaxDate;
          
          // 博客详情页的 lastmod = max(文章md修改时间, 全局依赖修改时间, 对应语言模板修改时间)
          item.lastmod = getLatestDate(postDate, globalMaxDate, templateDate);
          
          if (!postDate) {
            console.warn(`[Sitemap] ❌ 未找到博客时间戳: ${mapKey}`);
          }
        } else {
          // B. 匹配静态页面
          // 🛠️ 核心修复：item.url 是完整的绝对 URL (如 https://.../base/zh/)，
          // 必须先提取 pathname 并剥离 base，才能正确映射到 src/pages 目录
          let pathname = '';
          try {
            pathname = new URL(url).pathname;
          } catch {
            pathname = url; 
          }
          
          if (pathname.startsWith(SITE_BASE)) {
            pathname = pathname.substring(SITE_BASE.length);
          }
          
          // 🌟 深度 Review 修复：保留原始路径结构，优先查找带语言前缀的独立模板，找不到再回退到复用模板
          let rawPathname = pathname.replace(/^\//, '').replace(/\/$/, '');
          let targetPath = '';
          
          if (rawPathname === '' || rawPathname === 'index') {
            targetPath = path.join(cwd, 'src/pages/index.astro');
          } else {
            // 1. 优先尝试精确匹配 (包含 zh/ 前缀的独立模板)
            const exactAstroPath = path.join(cwd, 'src/pages', rawPathname + '.astro');
            const exactIndexPath = path.join(cwd, 'src/pages', rawPathname, 'index.astro');
            
            if (fs.existsSync(exactAstroPath)) {
              targetPath = exactAstroPath;
            } else if (fs.existsSync(exactIndexPath)) {
              targetPath = exactIndexPath;
            } else {
              // 2. 回退：剥离 zh/ 前缀再找 (适用于多语言复用同一个 .astro 模板的情况)
              let fallbackUrl = rawPathname;
              if (fallbackUrl.startsWith('zh/')) fallbackUrl = fallbackUrl.replace(/^zh\//, '');
              
              const fallbackAstroPath = path.join(cwd, 'src/pages', fallbackUrl + '.astro');
              const fallbackIndexPath = path.join(cwd, 'src/pages', fallbackUrl, 'index.astro');
              
              if (fs.existsSync(fallbackAstroPath)) {
                targetPath = fallbackAstroPath;
              } else if (fs.existsSync(fallbackIndexPath)) {
                targetPath = fallbackIndexPath;
              }
            }
          }

          const staticDate = getStaticPageGitDate(targetPath);
          
          // 🛠️ 核心优化：根据页面类型，合并对应的依赖组件时间 (兼容中英文路径)
          if (rawPathname === '' || rawPathname === 'index' || rawPathname === 'zh' || rawPathname === 'zh/index') {
            // 主页
            item.lastmod = getLatestDate(staticDate, globalMaxDate, homeMaxDate);
          } else if (rawPathname === 'blog' || rawPathname === 'zh/blog') {
            // 博客列表页
            item.lastmod = getLatestDate(staticDate, globalMaxDate, blogListMaxDate);
          } else {
            // 其他普通静态页面 (如 privacy, terms)
            item.lastmod = getLatestDate(staticDate, globalMaxDate);
          }

          if (!item.lastmod) {
            console.warn(`[Sitemap] ⚠️ 未找到静态页面文件或 Git 时间: ${targetPath} (URL: ${url})`);
          }
        }

        // ================= 2. 注入 x-default (核心新增) =================
        // 计算当前页面对应的英文 URL (作为 x-default 的兜底语言)
        let enUrl = url;
        if (url.includes(`${SITE_BASE}/zh/`)) {
          enUrl = url.replace(`${SITE_BASE}/zh/`, `${SITE_BASE}/`);
        } else if (url.endsWith(`${SITE_BASE}/zh`)) {
          enUrl = url.replace(`${SITE_BASE}/zh`, SITE_BASE);
        }

        // 确保 links 数组存在，并推入 x-default
        if (!item.links) item.links = [];
        // 检查 Astro 是否已经自动生成了 x-default
        const hasXDefault = item.links.some(link => link.lang === 'x-default');
        // 如果没有，我们再手动补充
        if (!hasXDefault) {
          item.links.push({
            url: enUrl,
            lang: 'x-default'
          });
        }
        
        return item;
      },
    }),

    compress({
      // 禁用插件的 CSS 压缩/重构功能
      // Astro 底层的 Vite 已经自带了完美的 CSS 压缩, 且完全兼容 Astro 的 Scoped CSS 机制.
      // 禁用 CSS 的压缩, 避免它破坏 @media 和 data-astro-cid 属性.
      CSS: false, // 兼容 @playform/compress
      css: false, // 兼容老版本 astro-compress

      // 禁用插件的 HTML 压缩功能
      // 修复插件在配置了 base 路径时, 内部路径拼接产生 "//dist/..." 导致 "Cannot compress file" 的 Bug.
      // Astro 原生默认已开启 compressHTML: true, 构建时会自动压缩 HTML, 无需插件重复处理.
      HTML: false,
      html: false,
    }),

    // 🌟 新增: 注入自定义的 HTML 注释清理集成
    removeHtmlComments(),
  ],
});