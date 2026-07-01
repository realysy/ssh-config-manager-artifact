/** src/utils/getAutoCover.ts
 * 抛弃物理文件读取，直接提取 Astro 处理后的最终 URL
 */

// 预加载 src/assets 下的所有图片 (仅作为兜底查表使用)
interface ImageModule {
  default: { src: string } | string;
}
const assetImages = import.meta.glob<ImageModule>('../assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true });

// 构建 "文件名 -> Vite 构建后 URL" 的映射表 (用于兜底处理未被 Astro 转换的相对路径)
const assetUrlMap = new Map<string, string>();
for (const key in assetImages) {
  const fileName = key.split('/').pop()?.split('\\').pop();
  if (!fileName) continue;
  const imgModule = assetImages[key].default;
  const imgUrl = typeof imgModule === 'string' ? imgModule : imgModule?.src;
  if (imgUrl) assetUrlMap.set(fileName, imgUrl);
}

export function getAutoCover(postBody: string | undefined): string | undefined {
  if (!postBody) return undefined;

  // 🎯 核心正则：同时匹配 Markdown 语法 ![]() 和 HTML 标签 <img src="">
  // 这能完美捕获 Astro 在构建时对 Markdown 进行的任何“暗中转换”
  const mdRegex = /!\[.*?\]\((.*?)\)/g;
  const htmlRegex = /<img[^>]+src=["']([^"']+)["']/g;
  
  let match;
  
  // 1. 优先尝试匹配 HTML 标签 (Astro 构建后的产物)
  while ((match = htmlRegex.exec(postBody)) !== null) {
    const url = match[1];
    if (url) return url; // 已经是最终的绝对路径 (如 /_astro/xxx.webp)，直接返回！
  }

  // 2. 如果没有 HTML 标签，尝试匹配原始 Markdown 语法
  while ((match = mdRegex.exec(postBody)) !== null) {
    const imgPath = match[1];
    if (!imgPath) continue;

    // A. 外部图片直接返回
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    // B. 已经是绝对路径 (如 /ssh-config-manager-artifact/...) 直接返回
    if (imgPath.startsWith('/')) {
      return imgPath;
    }

    // C. 兜底：如果是相对路径或 @/ 别名，提取文件名去 Map 里查表
    const fileName = imgPath.split('/').pop()?.split('\\').pop();
    if (fileName && assetUrlMap.has(fileName)) {
      return assetUrlMap.get(fileName);
    }
  }

  return undefined;
}