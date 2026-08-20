---
title: "使用 Github Action 进行 CI/CD"
pubDate: 2026-06-23
tags: ["开发日志", "CI/CD", "GitHub Actions", "跨平台"]
description: "分享如何使用 GitHub Actions 进行 CI/CD, 将 SSH Config Manager 自动编译为 Windows, Linux 和 macOS 的跨平台二进制文件."
---

SSH Config Manager 的首个正式版来了。

1. 支持分组管理 SSH 连接；分组文件格式与 \~/.ssh/config 保持兼容。
2. 简洁的 Web 界面工具，无需安装占用内存的软件。
3. 支持调用其他终端建立 SSH 连接，无需改变你的使用习惯。

   - 现代终端模拟器：

     - Wezterm
     - Alacritty
     - Kitty
   - 系统默认终端：

     - Windows Terminal
     - GNOME Terminal
     - KDE Konsole
4. 多平台支持。

   SSH Config Manager 是一个跨平台应用，支持以下平台：

   - x86\_64：Windows、Linux、macOS。
   - arm64：macOS。

   其中：

   - Windows 最低支持版本为 Windows 10（可尝试在 Windows 7 上运行）。
   - Linux 最低支持版本要求 glibc 2.31，例如 Ubuntu 20.04、Debian 11。
   - macOS 最低支持版本为 macOS 11 (Big Sur)。

主页：[https://www.mctek.site/ssh-config-manager-artifact/](/)
