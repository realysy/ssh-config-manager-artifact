import { imageSize } from 'image-size';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(utilsDir, '../..');
const assetsDir = path.resolve(projectRoot, 'src/assets');

// ✨ 1. 预加载 src/assets 下的所有图片 (Vite 特性)
interface ImageModule {
  default: { src: string; width?: number; height?: number; format?: string; } | string;
}

// 使用泛型 <ImageModule> 明确告诉 TS 返回的数据结构，消除 'unknown' 报错
const assetImages = import.meta.glob<ImageModule>('../assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true });

// ✨ 2. 核心优化：在顶层直接构建 "文件名 -> Vite 构建后 URL" 的映射表
// 彻底抛弃脆弱的 import.meta.url 物理路径匹配，无视构建时的路径漂移和跨平台问题
const assetUrlMap = new Map<string, string>();
for (const key in assetImages) {
  const fileName = path.basename(key);
  const imgModule = assetImages[key].default;
  const imgUrl = typeof imgModule === 'string' ? imgModule : imgModule?.src;
  if (imgUrl) {
    assetUrlMap.set(fileName, imgUrl);
  }
}

// 辅助函数：递归获取目录下所有文件的绝对路径
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!existsSync(dirPath)) return arrayOfFiles;
  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }
  return arrayOfFiles;
}

// 自动从 markdown 内容中提取并返回第一个符合条件图片路径
export function getAutoCover(postBody: string | undefined): string | undefined {
  if (!postBody) return undefined;

  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  let match;

  while ((match = imageRegex.exec(postBody)) !== null) {
    const imgPath = match[1];

    // A. 处理外部图片
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    // B. 提取文件名
    const fileName = path.basename(imgPath);
    let absoluteImagePath: string | undefined = undefined;

    // C. 尝试精确匹配 (@/ 别名或绝对路径)
    if (imgPath.startsWith('@/')) {
      absoluteImagePath = path.resolve(projectRoot, 'src', imgPath.slice(2));
    } else if (imgPath.startsWith('/')) {
      absoluteImagePath = path.resolve(projectRoot, 'public', imgPath.slice(1));
    }

    // D. 终极容错：如果精确匹配失败，直接在 src/assets 目录下按文件名全局搜索
    if (!absoluteImagePath || !existsSync(absoluteImagePath)) {
      const allAssetFiles = getAllFiles(assetsDir);
      const foundFile = allAssetFiles.find(f => path.basename(f) === fileName);
      if (foundFile) {
        absoluteImagePath = foundFile;
      }
    }

    // E. 检查物理文件并测尺寸
    if (absoluteImagePath && existsSync(absoluteImagePath)) {
      try {
        const imageBuffer = readFileSync(absoluteImagePath);
        const dimensions = imageSize(imageBuffer);  // 图片的真实宽高

        // 🎯 核心判断：分辨率是否大于等于 300x300
        if (dimensions.width && dimensions.width >= 300 && dimensions.height && dimensions.height >= 300) {
          // ✨ 3. 直接从 Map 中通过文件名获取 Vite 构建后的 URL (完美解决云端构建路径漂移问题)
          if (assetUrlMap.has(fileName)) {
            return assetUrlMap.get(fileName);
          }
        }
      } catch (e) {
        console.warn(`[AutoCover] ❌ Error reading image dimensions: ${absoluteImagePath}`, e);
      }
    }
  }

  // 如果没有找到合适的本地大图，但文章中有外部图片，则使用第一张外部图片
  return undefined;
}