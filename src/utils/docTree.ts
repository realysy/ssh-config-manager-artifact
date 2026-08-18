/**
 * src/utils/docTree.ts
 * 文档树形结构构建与展平工具
 */
import type { CollectionEntry } from 'astro:content';

export interface DocNode {
  id: string;
  slug: string; 
  type: 'folder' | 'file';
  title: string;
  order: number;
  children: DocNode[];
  doc?: CollectionEntry<'docs'>; 
}

/**
 * 构建文档树
 * @param docs 所有文档的集合
 * @param langPrefix 语言前缀 (如 'en/' 或 'zh/')
 */
export function buildDocTree(docs: CollectionEntry<'docs'>[], langPrefix: string): DocNode[] {
  const roots: DocNode[] = [];
  // 🌟 核心修复: 使用 Map 确保节点引用的绝对唯一性，彻底消灭重复节点
  const nodeMap = new Map<string, DocNode>();

  // 1. 先注册所有显式文件夹配置 (category: true)
  docs.forEach(doc => {
    if (doc.data.category) {
      const rawSlug = doc.id.replace(langPrefix, '').replace(/\.mdx?$/, '');
      const folderSlug = rawSlug.split('/').slice(0, -1).join('/');
      
      if (!nodeMap.has(folderSlug)) {
        nodeMap.set(folderSlug, {
          id: `${langPrefix}${folderSlug}`,
          slug: folderSlug,
          type: 'folder',
          title: doc.data.title,
          order: doc.data.order ?? 999,
          children: []
        });
      } else {
        const node = nodeMap.get(folderSlug)!;
        node.title = doc.data.title;
        node.order = doc.data.order ?? 999;
      }
    }
  });

  // 2. 注册所有普通文件节点，并确保其祖先文件夹存在
  docs.forEach(doc => {
    if (doc.data.category) return; 

    const rawSlug = doc.id.replace(langPrefix, '').replace(/\.mdx?$/, '');
    const parts = rawSlug.split('/');
    
    // 确保所有祖先文件夹都存在 (隐式创建)
    for (let i = 0; i < parts.length - 1; i++) {
      const folderSlug = parts.slice(0, i + 1).join('/');
      if (!nodeMap.has(folderSlug)) {
        nodeMap.set(folderSlug, {
          id: `${langPrefix}${folderSlug}`,
          slug: folderSlug,
          type: 'folder',
          title: folderSlug.split('/').pop()?.replace(/-/g, ' ') || folderSlug,
          order: 999,
          children: []
        });
      }
    }

    // 注册文件节点
    nodeMap.set(rawSlug, {
      id: doc.id,
      slug: rawSlug,
      type: 'file',
      title: doc.data.title,
      order: doc.data.order ?? 0,
      children: [],
      doc: doc
    });
  });

  // 3. 构建树形层级关系
  nodeMap.forEach(node => {
    const parts = node.slug.split('/');
    if (parts.length === 1) {
      roots.push(node);
    } else {
      const parentSlug = parts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentSlug);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node); 
      }
    }
  });

  // 4. 递归排序
  const sortNodes = (list: DocNode[]) => {
    list.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
    list.forEach(n => sortNodes(n.children));
  };

  sortNodes(roots);
  return roots;
}

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