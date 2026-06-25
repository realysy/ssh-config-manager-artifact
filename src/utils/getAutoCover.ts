import { imageSize } from 'image-size';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(utilsDir, '../..');
const assetsDir = path.resolve(projectRoot, 'src/assets');

// 定义图片模块的类型接口，兼容 Astro 的 ImageMetadata 对象和纯字符串
interface ImageModule {
  default: {
    src: string;
    width?: number;
    height?: number;
    format?: string;
  } | string;
}

// 使用泛型 <ImageModule> 明确告诉 TS 返回的数据结构，消除 'unknown' 报错
const assetImages = import.meta.glob<ImageModule>('../assets/**/*.{png,jpg,jpeg,webp,gif}', { eager: true });

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
        const dimensions = imageSize(imageBuffer);
        
        // 🎯 核心判断：分辨率是否大于等于 300x300
        if (dimensions.width && dimensions.width >= 300 && dimensions.height && dimensions.height >= 300) {
          for (const key in assetImages) {
            const globAbsolutePath = path.resolve(utilsDir, key);
            if (globAbsolutePath === absoluteImagePath) {
              // ✨ 3. 类型安全地提取 URL
              const imgModule = assetImages[key].default;
              // 兼容处理：如果是字符串直接用，如果是 Astro 的 ImageMetadata 对象则取 .src
              const imgUrl = typeof imgModule === 'string' ? imgModule : imgModule?.src;
              
              return imgUrl; 
            }
          }
        }
      } catch (e) {
        console.warn(`[AutoCover] ❌ Error reading image dimensions: ${absoluteImagePath}`, e);
      }
    }
  }

  return undefined;
}