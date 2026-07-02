import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
// 🛡️ 引入压缩与清理注释插件
import compress from 'astro-compress'; 

// 提取 base 配置，方便后续在 serialize 中复用
const SITE_BASE = '/ssh-config-manager-artifact';

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\.md$/, '').replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
}

const blogDir = path.join(process.cwd(), 'src/content/blog');
const blogGitTimeMap = new Map();

function getMdFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(getMdFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  return results;
}

async function initBlogGitTimes() {
  const mdFiles = getMdFiles(blogDir);
  console.log(`[Sitemap] 🚀 开始扫描 ${mdFiles.length} 篇博客...`);
  
  for (const fullPath of mdFiles) {
    const relativePath = path.relative(process.cwd(), fullPath).split(path.sep).join('/');
    const relativeBlogPath = path.relative(blogDir, fullPath);
    const slugifiedId = relativeBlogPath.split(path.sep).map(slugify).join('/');

    try {
      // 使用原生 execSync，并强制指定 cwd，捕获所有输出
      const gitDate = execSync(
        `git log -1 --format=%cI -- "${relativePath}"`, 
        { encoding: 'utf-8', cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (gitDate) {
        blogGitTimeMap.set(slugifiedId, new Date(gitDate));
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
      blogGitTimeMap.set(slugifiedId, stat.mtime);
    }
  }
  console.log(`[Sitemap] 🏁 扫描完成，共生成 ${blogGitTimeMap.size} 个时间戳。`);
}

await initBlogGitTimes();

// 获取静态页面 (.astro) 的 Git 时间 (统一使用 execSync 替代未导入的 gitlog)
function getStaticPageGitDate(targetPath) {
  if (!fs.existsSync(targetPath)) return null;
  const relativePath = path.relative(process.cwd(), targetPath).split(path.sep).join('/');
  try {
    const gitDate = execSync(
      `git log -1 --format=%cI -- "${relativePath}"`,
      { encoding: 'utf-8', cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    
    if (gitDate) {
      return new Date(gitDate);
    }
    return fs.statSync(targetPath).mtime; // 兜底：使用文件系统的最后修改时间
  } catch (e) {
    return fs.statSync(targetPath).mtime; // 兜底
  }
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
        const blogMatch = url.match(/\/(?:zh\/)?blog\/(.+)\/$/);
        if (blogMatch) {
          const slugId = blogMatch[1];
          if (blogGitTimeMap.has(slugId)) {
            item.lastmod = blogGitTimeMap.get(slugId);
          } else {
            console.warn(`[Sitemap] ❌ 未找到博客时间戳: ${slugId}`);
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
          
          let cleanUrl = pathname.replace(/^\//, '').replace(/\/$/, '');
          if (cleanUrl.startsWith('zh/')) cleanUrl = cleanUrl.replace(/^zh\//, '');
          
          let targetPath = '';
          if (cleanUrl === '') {
            targetPath = path.join(process.cwd(), 'src/pages/index.astro');
          } else {
            const astroPath = path.join(process.cwd(), 'src/pages', cleanUrl + '.astro');
            if (fs.existsSync(astroPath)) {
              targetPath = astroPath;
            } else {
              targetPath = path.join(process.cwd(), 'src/pages', cleanUrl, 'index.astro');
            }
          }

          const staticDate = getStaticPageGitDate(targetPath);
          if (staticDate) {
            item.lastmod = staticDate;
          } else {
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
    compress(),
  ],
});