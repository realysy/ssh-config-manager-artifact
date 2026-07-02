/** 
 * src/utils/config.ts
 * 站点全局静态配置 (构建时注入, 爬虫可直接抓取, SEO 友好)
 * usage:
 *   ---
 *   import { SITE_CONFIG } from '@/utils/config';
 *   ---
 *   <!-- 直接输出到 HTML, 搜索引擎爬虫完美抓取 -->
 *   <a href={SITE_CONFIG.githubRepo} target="_blank" rel="noopener">
 *      {SITE_CONFIG.appName} on GitHub
 *   </a>
 */
export const SITE_CONFIG = {
  appName: 'SSH Config Manager',
  appShortName: 'SMGR',
  author: 'realysy',
  // 全局静态链接, 统一在这里添加
  githubRepo: 'https://github.com/realysy/ssh-config-manager-artifact',
  downloadPage: 'https://github.com/realysy/ssh-config-manager-artifact/releases' 
};