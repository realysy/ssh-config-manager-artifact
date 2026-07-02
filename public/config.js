// config.js - Central configuration file
// Update this email address to change it across all pages
const CONFIG = {
  supportEmail: 'hello@smgr.mctek.site',
  githubRepo: 'https://github.com/realysy/ssh-config-manager-artifact',
  appName: 'SSH Config Manager',
  appShortName: 'SMGR'
};

// 将配置暴露到 window 全局对象, 方便其他脚本 (如 main.js) 读取
window.SMGR_CONFIG = CONFIG;

// Function to set email links across the page
document.addEventListener('DOMContentLoaded', function () {
  // Update all elements with data-email attribute
  document.querySelectorAll('[data-email]').forEach(element => {
    const email = CONFIG.supportEmail;
    if (element.tagName === 'A') {
      element.href = 'mailto:' + email;
    }
    if (element.hasAttribute('data-email-text')) {
      element.textContent = email;
    }
  });
});