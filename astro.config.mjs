import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 替换为您的实际 GitHub Pages URL
  site: 'https://smgr.real.abrdns.com/', 
  // 如果是项目主页 (非 username.github.io), 必须加上仓库名作为 base
  base: '/ssh-config-manager-artifact', 
  server: {
    port: 4321,
  },
});