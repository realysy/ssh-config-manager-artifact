/**
 * src/utils/docTree.ts
 * 文档树形结构构建与展平工具 (v3 - 显式路径注册表，彻底杜绝重复节点)
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

export function buildDocTree(docs: CollectionEntry<'docs'>[], langPrefix: string): DocNode[] {
  // 🌟 核心数据结构: 使用精确的原始路径作为 Key，绝不进行任何隐式转换
  const registry = new Map<string, DocNode>();

  // 辅助函数: 安全地获取或创建文件夹节点
  const ensureFolder = (folderPath: string): DocNode => {
    if (registry.has(folderPath)) {
      return registry.get(folderPath)!;
    }
    
    const name = folderPath.split('/').pop() || folderPath;
    const node: DocNode = {
      id: `${langPrefix}${folderPath}`,
      slug: folderPath,
      type: 'folder',
      title: name.replace(/-/g, ' '), // 默认标题
      order: 999,
      children: []
    };
    registry.set(folderPath, node);
    return node;
  };

  // 1. 第一遍: 仅处理 category: true 的文件，建立所有显式文件夹
  docs.forEach(doc => {
    if (!doc.data.category) return;
    
    // 移除语言前缀和文件名(index.md)，得到纯文件夹路径
    const fullPath = doc.id.substring(langPrefix.length).replace(/\/index\.mdx?$/, '');
    const folder = ensureFolder(fullPath);
    
    // 显式配置无条件覆盖默认值
    folder.title = doc.data.title;
    folder.order = doc.data.order ?? 999;
  });

  // 2. 第二遍: 处理普通文件，并补全缺失的隐式祖先文件夹
  docs.forEach(doc => {
    if (doc.data.category) return;
    
    // 移除语言前缀和 .md/.mdx 后缀，得到文件的完整路径(不含扩展名)
    const filePath = doc.id.substring(langPrefix.length).replace(/\.mdx?$/, '');
    const parts = filePath.split('/');
    
    // 向上遍历，确保每一级祖先文件夹都存在
    for (let i = 1; i < parts.length; i++) {
      const ancestorPath = parts.slice(0, i).join('/');
      ensureFolder(ancestorPath);
    }
    
    // 注册文件节点
    registry.set(filePath, {
      id: doc.id,
      slug: filePath,
      type: 'file',
      title: doc.data.title,
      order: doc.data.order ?? 0,
      children: [],
      doc: doc
    });
  });

  // 3. 第三遍: 根据路径层级关系组装树
  const roots: DocNode[] = [];
  registry.forEach(node => {
    const parts = node.slug.split('/');
    if (parts.length === 1) {
      // 顶层节点
      roots.push(node);
    } else {
      // 查找直接父节点
      const parentPath = parts.slice(0, -1).join('/');
      const parent = registry.get(parentPath);
      
      if (parent && parent.type === 'folder') {
        parent.children.push(node);
      } else {
        // 🛡️ 极端兜底: 如果父节点丢失(理论上不应发生)，作为根节点处理
        console.warn(`[DocTree] ⚠️ 节点 "${node.slug}" 找不到父节点 "${parentPath}"，已提升为根节点`);
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