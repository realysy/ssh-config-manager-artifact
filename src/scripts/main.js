/**
 * src/scripts/main.js
 * 架构说明: 
 * 本文件由 Astro 打包, 在 <body> 底部异步加载.
 * 主要负责"用户交互"相关的逻辑 (如主题切换, 灯箱, 语言缓存).
 * 而"页面渲染前"的相关逻辑 (如语言重定向, 防 FOUC) 在 Layout.astro 的 <head> 中以内联脚本执行.
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 初始化截图 Lightbox (灯箱) 功能
  initLightbox();

  // 初始化亮暗主题切换
  initThemeToggle();
  
  // 语言切换按钮: 点击时缓存用户选择, 后续访问优先使用缓存
  const langSwitchBtn = document.querySelector('.lang-switch-btn');
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      // 从 href 中提取目标语言: 包含 /zh/ 或以 /zh 结尾则为中文, 否则为英文
      const href = langSwitchBtn.href;
      const targetLang = (href.includes('/zh/') || href.endsWith('/zh') || href.endsWith('/zh/')) ? 'zh' : 'en';
      localStorage.setItem('smgr_lang', targetLang);
      // 不阻止默认行为, 让链接正常跳转
    });
  }
});

// ========== Lightbox 灯箱功能 ==========
function initLightbox() {
  // 动态创建 Lightbox DOM, 避免在 Layout 中写死, 让 HTML 源码更干净
  const lightboxHTML = `
    <div class="lightbox-overlay" id="lightbox">
      <span class="lightbox-close" id="lightbox-close">&times;</span>
      <img src="" alt="Screenshot Preview" id="lightbox-img">
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  // 1. 为底部截图卡片图片绑定点击事件
  document.querySelectorAll('.screenshot-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // 2. 核心新增：为 Features 区域的文字链接绑定点击事件
  document.querySelectorAll('.lightbox-trigger').forEach(link => {
    link.style.cursor = 'zoom-in'; // 鼠标悬浮时显示放大图标，暗示可预览
    link.addEventListener('click', (e) => {
      e.preventDefault(); // 🛑 核心：阻止 a 标签默认的跳转/下载行为
      const imgSrc = link.getAttribute('href');
      if (imgSrc) {
        lightboxImg.src = imgSrc;
        // 复用 a 标签的 title 属性作为图片的 alt 文本，提升可访问性
        lightboxImg.alt = link.title || 'Screenshot Preview'; 
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // 3. 关闭逻辑
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========== 亮暗主题切换功能 ==========
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // 读取本地存储或系统偏好
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    
    // 同步更新 data-tooltip 提示
    const isZh = document.documentElement.lang === 'zh';
    const tooltipText = theme === 'dark' 
      ? (isZh ? '切换到亮色模式' : 'Switch to light mode') 
      : (isZh ? '切换到暗黑模式' : 'Switch to dark mode');
    toggleBtn.setAttribute('data-tooltip', tooltipText);
  }
}


/**
 * 🍎 iOS Safari 专属兜底: 当 CSS 媒体查询失效时强制应用移动端样式
 * 原因: iOS Safari 对 100vw 的计算偏差 + 缓存策略可能导致 @media 不触发
 */
function applyMobileFallback() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isIOS && isSafari) {
    // ✅ 检测实际视口宽度（排除滚动条影响）
    const actualWidth = document.documentElement.clientWidth || window.innerWidth;
    
    // ✅ 如果实际宽度 <= 768 但 CSS 未应用移动端样式，强制注入
    if (actualWidth <= 768) {
      const langText = document.querySelector('.lang-switch-btn .lang-text');
      if (langText && getComputedStyle(langText).display !== 'none') {
        // 🔥 强制隐藏语言文字
        langText.style.setProperty('display', 'none', 'important');
        
        // 🔥 强制调整按钮样式
        const langBtn = document.querySelector('.lang-switch-btn');
        if (langBtn) {
          langBtn.style.setProperty('margin-left', '0', 'important');
          langBtn.style.setProperty('padding', '6px 8px', 'important');
        }
        
        console.log('[SMGR] iOS Safari fallback applied');
      }
    }
  }
}

// ✅ 在页面加载完成 + 窗口大小变化时都执行兜底检查
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyMobileFallback);
} else {
  applyMobileFallback();
}
window.addEventListener('resize', applyMobileFallback);
window.addEventListener('orientationchange', applyMobileFallback); // ✅ iOS 旋转屏幕时重新检测
