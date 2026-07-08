/** src/utils/extractTags.ts
 * 极客版自动标签提取器
 * 如果博客 Front Matter 中已有 tags 字段，则直接使用，不再自动提取；
 * 否则自动从 Markdown 正文中提取代码块语言、技术缩写和预设技术栈。
 */
export function extractAutoTags(body: string, existingTags: string[] = []): string[] {
  // 如果 Front Matter 中已有标签，直接返回（去重并限制数量）
  if (existingTags.length > 0) {
    const normalized = existingTags.map(t => t.toLowerCase());
    const unique = [...new Set(normalized)];
    return unique.slice(0, 6);
  }

  const tags = new Set<string>();

  // 1. 提取代码块语言 (例如 ```yaml -> yaml, ```bash -> bash)
  const codeBlockRegex = /```([a-zA-Z0-9]+)\n/g;
  let match;
  while ((match = codeBlockRegex.exec(body)) !== null) {
    const lang = match[1].toLowerCase();
    // 过滤掉无意义的文本标记
    if (!['text', 'markdown', 'plaintext', 'txt', 'env', 'log', 'md'].includes(lang)) {
      tags.add(lang);
    }
  }

  // 2. 提取文中的大写技术缩写 (如 SSH, CI/CD, UI, API, HTML)
  const acronymRegex = /\b([A-Z]{2,}(?:\/[A-Z]+)*)\b/g;
  while ((match = acronymRegex.exec(body)) !== null) {
    const acronym = match[1];
    // 过滤掉常见的英文大写单词（防止误判）
    const stopWords = ['THE', 'AND', 'FOR', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'IT', 'IS', 'AS', 'AT', 'BY', 'WE', 'OR', 'ON', 'TO'];
    if (!stopWords.includes(acronym)) {
      tags.add(acronym.toLowerCase());
    }
  }

  // 3. 匹配预设的核心技术栈字典 (只要文中出现就自动打标)
  const techDict = [
    'astro', 'github', 'git', 'node.js', 'pnpm', 'vite', 'docker', 
    'linux', 'windows', 'macos', 'wezterm', 'alacritty', 'kitty', 
    'ssh', 'ci/cd', 'webui', 'python', 'flask', 'nuitka'
  ];
  const lowerBody = body.toLowerCase();
  for (const keyword of techDict) {
    if (lowerBody.includes(keyword)) {
      tags.add(keyword);
    }
  }

  // 去重后，最多返回 6 个标签，防止撑爆卡片
  return Array.from(tags).slice(0, 6);
}