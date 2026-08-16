---
title: "终端模拟器: 常见的 SSH 客户端 | Xshell, Tabby, WindTerm, xTerminal ..."
pubDate: 2026-08-14
tags: ["终端模拟器", "终端", "SSH", "连接管理", "xshell"]
description: "介绍了常见的、作者用过的终端模拟器/SSH客户端, 包括但不限于: Xshell, Tabby, WindTerm, xTerminal..."
---

- Xshell 与 Mobaxterm：

  - xshell是我用的第一款SSH连接管理软件，与xftp配套很好用，软件也很轻量；用了两三年，可惜只支持 windows 后来又跨平台需求就不用了。
  - mobaxterm界面太古早，用不惯，而且也是只支持 windows.
- Tabby：23~24两年前我曾在Windows重度使用，文件传输功能还可以，但感觉过于笨重：启动速度慢，内存占用高，日志刷新多/快的时候卡顿。
- WindTerm: 推荐很多（无论论坛里面还是大模型推荐），但维护不活跃（2026.8的最后更新还是2025.2），以前用过，bug严重（比如vim编辑文件后乱码），而且推荐的人很多说WindTerm是C++ Qt开发的，轻量，但我实测启动速度、内存占用、界面流畅性都没有明显优势；issue很多都没有关闭。
- xTerminal：近两年24~26我一直在用，不再推荐，新版解决了启动卡顿问题，但限制只能有2个会话；终端不是原生的，不支持向上历史、Ctrl+Shift+C复制
- Electerm: 界面逻辑不太行; ubuntu 20 不支持连本地shell；layout 工作区保存后再打开不能自动重连；不支持多tab。但终端比 xterminal 好用。
- Shell360：ubuntu 20不支持安装；而且过于简陋了，似乎只能打开ssh，不支持左右并排拆分、自定义布局，不支持sftp传输文件
- [WezTerm](./wezterm-install-and-my-config.md)：1个标签页包含3个cmd pane，内存101M，但没有可视化 SSH 管理页面
- contour terminal: 1个空终端标签页Powershell内存115M
- termora：2.0 beta, 账号同步收费
