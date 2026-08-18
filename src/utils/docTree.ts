/**
 * src/utils/docTree.ts
 * 文档树形结构构建与展平工具
 */
import type { CollectionEntry } from 'astro:content';

export interface DocNode {
  id: string;
  slug: string; // 去除语言前缀和 .md 后缀的路径
  type: 'folder' | 'file';
  title: string;
  order: number;
  children: DocNode[];
  doc?: CollectionEntry<'docs'>; // 仅 file 类型包含原始文档数据
}

/**
 * 构建文档树
 * @param docs 所有文档的集合
 * @param langPrefix 语言前缀 (如 'en/' 或 'zh/')
 */
export function buildDocTree(docs: CollectionEntry<'docs'>[], langPrefix: string): DocNode[] {
  const nodes: Record<string, DocNode> = {};
  const roots: DocNode[] = [];

  // 1. 预处理：提取所有节点（包括隐式文件夹）
  docs.forEach(doc => {
    const rawSlug = doc.id.replace(langPrefix, '').replace(/\.mdx?$/, '');
    const parts = rawSlug.split('/');
    
    // 注册所有层级的文件夹 (确保父节点始终存在)
    for (let i = 0; i < parts.length - 1; i++) {
      const folderSlug = parts.slice(0, i + 1).join('/');
      if (!nodes[folderSlug]) {
        nodes[folderSlug] = {
          id: `${langPrefix}${folderSlug}`,
          slug: folderSlug,
          type: 'folder',
          // 默认使用文件夹名称作为标题 (将连字符替换为空格)
          title: folderSlug.split('/').pop()?.replace(/-/g, ' ') || folderSlug,
          order: 999,
          children: []
        };
      }
    }

    // 注册文件或文件夹的元数据 (index.md)
    if (doc.data.category) {
      // 这是一个文件夹的配置文件 (如 features/index.md)
      const actualFolderSlug = parts.slice(0, -1).join('/');
      
      if (!nodes[actualFolderSlug]) {
         nodes[actualFolderSlug] = {
          id: `${langPrefix}${actualFolderSlug}`,
          slug: actualFolderSlug,
          type: 'folder',
          title: doc.data.title,
          order: doc.data.order ?? 999,
          children: []
        };
      } else {
        // 覆盖默认标题和排序
        nodes[actualFolderSlug].title = doc.data.title;
        nodes[actualFolderSlug].order = doc.data.order ?? 999;
      }
    } else {
      // 这是一个普通文档文件
      const fileSlug = rawSlug;
      nodes[fileSlug] = {
        id: doc.id,
        slug: fileSlug,
        type: 'file',
        title: doc.data.title,
        order: doc.data.order ?? 0,
        children: [],
        doc: doc
      };
    }
  });

  // 2. 构建树形层级关系
  Object.values(nodes).forEach(node => {
    const parts = node.slug.split('/');
    if (parts.length === 1) {
      roots.push(node);
    } else {
      const parentSlug = parts.slice(0, -1).join('/');
      if (nodes[parentSlug]) {
        nodes[parentSlug].children.push(node);
      } else {
        roots.push(node); // 兜底
      }
    }
  });

  // 3. 递归排序 (文件夹和文件混合排序)
  const sortNodes = (list: DocNode[]) => {
    list.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      // order 相同时，文件夹优先，或者按字母顺序
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
    list.forEach(n => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}

/**
 * 展平文档树 (先序遍历 DFS)
 * 用于计算"上一篇/下一篇"，确保能完美跨越文件夹边界
 */
export function flattenDocTree(roots: DocNode[]): DocNode[] {
  const flat: DocNode[] = [];
  const traverse = (nodes: DocNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'file') flat.push(node);
      traverse(node.children);
    });
  };
  traverse(roots);
  return flat;
}