import { getCollection } from 'astro:content';

export interface GroupedPost {
  // 无论文章是放在 26.06/first-release.md 还是 zh/26.06/first-release.md，它们的 coreSlug 都是 26.06/first-release
  coreSlug: string;
  enPost?: any;
  zhPost?: any;
}

// 获取所有文章并按核心 Slug 分组
export async function getGroupedPosts() {
  const posts = await getCollection('blog');
  const grouped = new Map<string, GroupedPost>();

  for (const post of posts) {
    const isZh = post.id.startsWith('zh/');
    // 剥离 'zh/' 前缀, 得到核心 Slug
    const coreSlug = isZh ? post.id.replace(/^zh\//, '') : post.id;
    
    if (!grouped.has(coreSlug)) {
      grouped.set(coreSlug, { coreSlug });
    }
    
    const group = grouped.get(coreSlug)!;
    if (isZh) {
      group.zhPost = post;
    } else {
      group.enPost = post;
    }
  }

  return Array.from(grouped.values());
}

// 根据当前页面语言, 获取应该展示的文章 (优先对应语言, 否则回退到原语言)
export function getDisplayPost(group: GroupedPost, currentLang: 'en' | 'zh') {
  if (currentLang === 'zh') {
    return group.zhPost || group.enPost; // 优先中文, 回退英文
  } else {
    return group.enPost || group.zhPost; // 优先英文, 回退中文
  }
}