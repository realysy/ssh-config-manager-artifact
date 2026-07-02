/**
 * public/config.js
 * 文件用于在客户端网页动态注入不想被爬虫的信息, 如 Email. 
 * 因为爬虫无法执行JS, 也就无法获取动态注入的信息.
 */
const CONFIG = {
  supportEmail: 'hello@smgr.mctek.site',
};

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