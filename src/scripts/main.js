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

// ========== Lightbox 灯箱功能 (含完美锚点缩放与拖拽) ==========
function initLightbox() {
  const lightboxHTML = `
    <div class="lightbox-overlay" id="lightbox">
      <span class="lightbox-close" id="lightbox-close">&times;</span>
      <img src="" alt="Screenshot Preview" id="lightbox-img">
      <div class="lightbox-toolbar" id="lightbox-toolbar">
        <button id="lightbox-zoom-out" title="缩小 (Zoom Out / -)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <button id="lightbox-zoom-reset" title="重置 (Reset / 0)">1:1</button>
        <button id="lightbox-zoom-in" title="放大 (Zoom In / +)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX, startY;
  
  // 核心新增：记录图片未变换时的视口原点坐标
  let originX = 0; 
  let originY = 0;

  function updateTransform() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    if (scale > 1) lightboxImg.classList.add('zoomed');
    else lightboxImg.classList.remove('zoomed');
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  // 核心重构：以视口中心为锚点的通用缩放函数
  function zoomAtCenter(newScale) {
    const scaleChange = newScale / scale;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    
    translateX = (cx - originX) - scaleChange * (cx - originX - translateX);
    translateY = (cy - originY) - scaleChange * (cy - originY - translateY);
    scale = newScale;
    
    if (scale <= 1) { translateX = 0; translateY = 0; scale = 1; }
    updateTransform();
  }

  function zoomIn() { zoomAtCenter(Math.min(scale + 0.25, 4)); }
  function zoomOut() { zoomAtCenter(Math.max(scale - 0.25, 0.5)); }

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    resetTransform(); 
    lightboxImg.classList.remove('grabbing');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 核心修复：在 DOM 渲染后，获取图片未变换时的视口左上角坐标
    requestAnimationFrame(() => {
        const rect = lightboxImg.getBoundingClientRect();
        originX = rect.left;
        originY = rect.top;
    });
  }

  // 1. 绑定触发器
  document.querySelectorAll('.screenshot-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  document.querySelectorAll('.lightbox-trigger').forEach(link => {
    link.style.cursor = 'zoom-in'; 
    link.addEventListener('click', (e) => {
      e.preventDefault(); 
      const imgSrc = link.getAttribute('href');
      if (imgSrc) openLightbox(imgSrc, link.title || 'Screenshot Preview');
    });
  });

  // 2. 工具栏按钮
  document.getElementById('lightbox-zoom-in').addEventListener('click', zoomIn);
  document.getElementById('lightbox-zoom-out').addEventListener('click', zoomOut);
  document.getElementById('lightbox-zoom-reset').addEventListener('click', resetTransform);

  // 3. 拖拽平移逻辑 (PC & 移动端单指)
  const handleDragStart = (clientX, clientY) => {
    if (scale > 1) {
      isDragging = true;
      startX = clientX - translateX;
      startY = clientY - translateY;
      lightboxImg.classList.add('grabbing');
    }
  };
  const handleDragMove = (clientX, clientY) => {
    if (isDragging) {
      translateX = clientX - startX;
      translateY = clientY - startY;
      updateTransform();
    }
  };
  const handleDragEnd = () => {
    if (isDragging) {
      isDragging = false;
      lightboxImg.classList.remove('grabbing');
    }
  };

  lightboxImg.addEventListener('mousedown', (e) => { handleDragStart(e.clientX, e.clientY); e.preventDefault(); });
  document.addEventListener('mousemove', (e) => handleDragMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', handleDragEnd);

  // 4. 移动端触摸逻辑 (单指拖拽 + 双指完美锚点缩放)
  let initialPinchDistance = 0, initialPinchScale = 1;
  let initialPinchCenterX = 0, initialPinchCenterY = 0;
  let initialTranslateX = 0, initialTranslateY = 0;
  let isPinching = false;

  const getPinchDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  const getPinchCenter = (touches) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });

  lightboxImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isPinching = true;
      isDragging = false;
      lightboxImg.classList.remove('grabbing');
      initialPinchDistance = getPinchDistance(e.touches);
      initialPinchScale = scale;
      const center = getPinchCenter(e.touches);
      initialPinchCenterX = center.x;
      initialPinchCenterY = center.y;
      initialTranslateX = translateX;
      initialTranslateY = translateY;
      lightboxImg.style.transition = 'none';
    } else if (e.touches.length === 1 && !isPinching) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  lightboxImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const currentDistance = getPinchDistance(e.touches);
      const ratio = currentDistance / initialPinchDistance;
      const newScale = Math.max(0.5, Math.min(5, initialPinchScale * ratio));
      const scaleChange = newScale / initialPinchScale;
      const center = getPinchCenter(e.touches);
      
      // 🌟 核心修复：引入 originX/Y 进行坐标系对齐，实现真正的“指哪打哪”
      translateX = (center.x - originX) - scaleChange * (initialPinchCenterX - originX - initialTranslateX);
      translateY = (center.y - originY) - scaleChange * (initialPinchCenterY - originY - initialTranslateY);
      
      scale = newScale;
      updateTransform();
    } else if (e.touches.length === 1 && isDragging && !isPinching) {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  lightboxImg.addEventListener('touchend', (e) => {
    if (isPinching && e.touches.length < 2) {
      isPinching = false;
      if (scale <= 1) resetTransform();
      lightboxImg.style.transition = '';
      if (e.touches.length === 1) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (!isPinching) {
      handleDragEnd();
    }
  });
  lightboxImg.addEventListener('touchcancel', () => { isPinching = false; handleDragEnd(); lightboxImg.style.transition = ''; });

  // 5. PC 端滚轮缩放 (以视口中心为锚点)
  lightbox.addEventListener('wheel', (e) => {
    if (lightbox.classList.contains('active')) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn(); else zoomOut();
    }
  }, { passive: false });

  // 6. 双击放大/重置
  lightboxImg.addEventListener('dblclick', () => {
    if (scale > 1) resetTransform();
    else zoomAtCenter(2);
  });

  // 7. 关闭逻辑与快捷键
  function closeLightbox() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetTransform();
    }
  });
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
