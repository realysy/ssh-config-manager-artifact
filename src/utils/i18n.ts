/**
 * src/utils/i18n.ts
 * 多语言工具函数：统一判断当前页面语言、生成语言相关路径
 */

/**
 * 根据当前页面路径和 base URL 判断语言
 * @param pathname - 当前页面的完整路径名，如 Astro.url.pathname
 * @param baseUrl  - 可选的 base URL，如 import.meta.env.BASE_URL
 * @returns 'zh' | 'en'
 */
export function getLangFromPath(
  pathname: string,
  baseUrl?: string
): 'zh' | 'en' {
  // 1. 剥离 baseUrl 前缀，得到相对于站点根目录的路径
  let relative = pathname;
  if (baseUrl && baseUrl !== '/') {
    // 确保 baseUrl 以斜杠结尾
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    if (relative.startsWith(normalizedBase)) {
      relative = relative.slice(normalizedBase.length);
    }
  }

  // 2. 移除开头的斜杠，方便判断
  if (relative.startsWith('/')) {
    relative = relative.slice(1);
  }

  // 3. 判断是否为中文页面（路径以 'zh' 开头或正好是 'zh'）
  if (relative === 'zh' || relative.startsWith('zh/')) {
    return 'zh';
  }
  return 'en';
}

/**
 * 根据目标语言生成对应路径
 * @param currentPathname  - 当前页面的完整路径名
 * @param targetLang       - 目标语言 'zh' | 'en'
 * @param baseUrl          - 可选的 base URL
 * @returns 目标语言的完整路径
 */
export function localizePath(
  currentPathname: string,
  targetLang: 'zh' | 'en',
  baseUrl?: string
): string {
  const currentLang = getLangFromPath(currentPathname, baseUrl);

  // 剥离 baseUrl 前缀，获取相对路径
  let relative = currentPathname;
  if (baseUrl && baseUrl !== '/') {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    if (relative.startsWith(normalizedBase)) {
      relative = relative.slice(normalizedBase.length);
    }
  }

  // 去掉开头的 '/'
  if (relative.startsWith('/')) relative = relative.slice(1);

  // 如果当前是中文，则去掉 'zh/' 前缀；否则保留原样（英文）
  let corePath = '';
  if (currentLang === 'zh') {
    // 去掉 'zh/' 或 'zh'
    corePath = relative.startsWith('zh/')
      ? relative.slice(3)
      : relative === 'zh'
      ? ''
      : relative;
  } else {
    corePath = relative;
  }

  // 根据目标语言拼接前缀
  let localized = '';
  if (targetLang === 'zh') {
    localized = 'zh/' + corePath;
  } else {
    localized = corePath;
  }

  // 确保最前面有 '/'
  if (!localized.startsWith('/')) localized = '/' + localized;

  // 拼接 baseUrl
  const normalizedBase = baseUrl && baseUrl !== '/'
    ? (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/')
    : '/';

  return normalizedBase + localized.slice(1); // 去掉开头多余的斜杠，因为 baseUrl 已有
}