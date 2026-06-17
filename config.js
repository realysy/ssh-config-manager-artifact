// config.js - Central configuration file
// Update this email address to change it across all pages
const CONFIG = {
  supportEmail: 'ysyjs3@163.com',
  githubRepo: 'https://github.com/realysy/ssh-config-manager-artifact',
  appName: 'SSH Config Manager'
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