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

const blogDir = path.join(cwd, 'src/content/blog');  // 博客目录与时间戳 Map
const docsDir = path.join(cwd, 'src/content/docs');  // 文档目录与时间戳 Map

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

// 文件 Git 时间扫描函数
async function scanDirectoryForGitTimes(dir, label) {
  const timeMap = new Map();
  const mdFiles = getMdFiles(dir);
  
  if (mdFiles.length === 0) {
    console.log(`[Sitemap] ℹ️ 未发现${label}文件, 跳过 Git 扫描。`);
    return timeMap;
  }
  
  console.log(`[Sitemap] 🚀 开始扫描 ${mdFiles.length} 篇${label}...`);
  
  for (const fullPath of mdFiles) {
    const relativePath = path.relative(cwd, fullPath).split(path.sep).join('/');
    const rawRelativePath = path.relative(dir, fullPath).split(path.sep).join('/');
    const mapKey = slugifyPath(rawRelativePath);

    try {
      const gitDate = execSync(
        `git log -1 --format=%cI -- "${relativePath}"`, 
        { encoding: 'utf-8', cwd: cwd, stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (gitDate) {
        timeMap.set(mapKey, new Date(gitDate));
      } else {
        throw new Error('Git 返回为空');
      }
    } catch (e) {
      // 兜底：使用文件系统的最后修改时间 (mtime)
      const stat = fs.statSync(fullPath);
      timeMap.set(mapKey, stat.mtime);
    }
  }
  console.log(`[Sitemap] 🏁 ${label}扫描完成，共生成 ${timeMap.size} 个精准时间戳。`);
  return timeMap;
}

// 分别扫描博客和文档目录，直接赋值给常量
const blogGitTimeMap = await scanDirectoryForGitTimes(blogDir, '博客');
const docGitTimeMap = await scanDirectoryForGitTimes(docsDir, '文档');


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

// 4. 博客详情页依赖 (极致精细化：中英文模板分离)
const enBlogPostDeps = ['src/pages/blog/[...slug].astro', 'src/components/Giscus.astro'];
const enBlogPostMaxDate = getMaxGitDate(enBlogPostDeps.map(p => path.join(cwd, p)));

const zhBlogPostDeps = ['src/pages/zh/blog/[...slug].astro', 'src/components/Giscus.astro'];
const zhBlogPostMaxDate = getMaxGitDate(zhBlogPostDeps.map(p => path.join(cwd, p)));

// 文档详情页及列表页的依赖组件 (Sidebar, TOC, PrevNext 等)
const docDeps = [
  'src/pages/doc/[...slug].astro',
  'src/pages/zh/doc/[...slug].astro',
  'src/pages/doc/index.astro',
  'src/pages/zh/doc/index.astro',
  'src/components/docs/DocSidebar.astro',
  'src/components/docs/DocTOC.astro',
  'src/components/docs/DocPrevNext.astro',
  'src/components/docs/DocStyles.astro',
];
const docMaxDate = getMaxGitDate(docDeps.map(p => path.join(cwd, p)));

console.log(`[Sitemap] 🕒 依赖时间戳计算完成: 全局(${globalMaxDate?.toISOString()}), 主页(${homeMaxDate?.toISOString()}), 列表(${blogListMaxDate?.toISOString()}), 详情(${zhBlogPostMaxDate?.toISOString()}), 文档(${docMaxDate?.toISOString()})`);


// 🛡️ 自定义 Astro 集成: 构建后清理 HTML 注释 & 修复 Markdown 内部链接
function postBuildCleanup() {
  return {
    name: 'post-build-cleanup',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // dir 是一个 URL 对象, 需要转换为本地文件系统路径
        const outDir = fileURLToPath(dir);
        let processedCount = 0;

        // 递归遍历 dist 目录
        const processDir = (currentDir) => {
          const files = fs.readdirSync(currentDir);
          for (const file of files) {
            const fullPath = path.join(currentDir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              processDir(fullPath);
            } else if (file.endsWith('.html')) {
              let content = fs.readFileSync(fullPath, 'utf-8');
              const originalContent = content;

              // 🌟 1: 智能修复本地 .md/.mdx 链接 (完美兼顾 VSCode 跳转与 Astro 路由)
              content = content.replace(/href="(?!https?:\/\/|mailto:|#|data:)(?:\.\/)?([^"]*?)\.mdx?(?=[?#"])/gi, (match, p1) => {
                // p1 是去掉 .md 和可能存在的 ./ 后的路径
                // 例如: "wezterm-slug" (同级) 或 "../07/old-slug" (跨级)
                
                // 在 Astro 的 directory 模式下，URL 表现为目录 (如 /slug/)
                // 如果 p1 不包含 "/" (说明是物理同级的兄弟文件)，在浏览器中必须退一级 "../" 才能跳到兄弟目录
                if (!p1.includes('/')) {
                  return `href="../${p1}/"`;
                }
                // 如果包含 "/" (说明是跨目录的相对路径，如 ../07/slug)，直接补全尾部 "/"
                return `href="${p1}/"`;
              });

              // 🌟 2: 移除所有 HTML 注释 (包含换行)
              content = content.replace(/<!--[\s\S]*?-->/g, '');
              
              // 只有内容发生改变时才写回磁盘, 减少不必要的 I/O
              if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                processedCount++;
              }
            }
          }
        };

        processDir(outDir);
        console.log(`[post-build-cleanup] 🧹 构建后处理完成, 共优化 ${processedCount} 个 HTML 文件 (含链接修复与注释清理).`);
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
          
          // 拼接出与 scanDirectoryForGitTimes() 中完全一致的 Map Key
          const mapKey = `${langPrefix}${slug}`;
          const postDate = blogGitTimeMap.get(mapKey);
          
          // 🌟 极致精细化：根据语言前缀，精准选择对应的模板依赖时间
          const templateDate = langPrefix === 'zh/' ? zhBlogPostMaxDate : enBlogPostMaxDate;
          
          // 博客详情页的 lastmod = max(文章md修改时间, 全局依赖修改时间, 对应语言模板修改时间)
          item.lastmod = getLatestDate(postDate, globalMaxDate, templateDate);
          
          if (!postDate) {
            console.warn(`[Sitemap] ❌ 未找到博客时间戳: ${mapKey}`);
          }
        } 
        // 🌟 新增: 匹配文档详情页
        else if (url.match(/\/(zh\/)?doc\/(.+)\/$/)) {
          const docMatch = url.match(/\/(zh\/)?doc\/(.+)\/$/);
          // 英文 URL 没有 zh/ 前缀，默认补全 'en/' 以匹配 Map 中的 Key
          const langPrefix = docMatch[1] || 'en/'; 
          const slug = docMatch[2]; 
          
          // 拼接出与 initDocGitTimes 中完全一致的 Map Key (如 'en/getting-started/installation')
          const mapKey = `${langPrefix}${slug}`;
          const postDate = docGitTimeMap.get(mapKey);
          
          // 文档详情页的 lastmod = max(文章md修改时间, 全局依赖修改时间, 文档组件修改时间)
          item.lastmod = getLatestDate(postDate, globalMaxDate, docMaxDate);
          
          if (!postDate) {
            console.warn(`[Sitemap] ❌ 未找到文档时间戳: ${mapKey}`);
          }
        } 
        else {
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
          } else if (rawPathname === 'doc' || rawPathname === 'zh/doc') {
            // 文档列表页
            item.lastmod = getLatestDate(staticDate, globalMaxDate, docMaxDate);
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

    // 注入自定义的 postBuild 集成
    postBuildCleanup(),
  ],
});