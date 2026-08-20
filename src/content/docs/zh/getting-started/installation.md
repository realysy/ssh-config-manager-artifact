---
title: "安装"
pubDate: 2026-08-18
order: 10000
description: "SSH Config Manager (SMGR) 的安装步骤文档, 支持跨平台: Windows, Linux, macOS."
---

SSH Config Manager 是便携版应用程序, 你可以直接从 [GitHub Releases](https://github.com/realysy/ssh-config-manager-artifact/releases) 下载最新版本.

#### 特定系统启动说明
- **Windows**: 直接解压压缩包并运行 `ssh-config-manager.exe`.
- **Linux**: 解压后, 建议创建一个 `.desktop` 文件以便从应用程序菜单轻松启动. 确保可执行文件具有执行权限 (`chmod +x ssh-config-manager`).
- **macOS**: 由于 Gatekeeper 限制, 首次运行时可能需要右键点击应用程序并选择 "打开", 或在终端中运行 `chmod +x ssh-config-manager` 以绕过安全警告.

#### 运行后
软件将自动打开浏览器 WebUI: [http://localhost:18323](http://localhost:18323). 若 18323 端口不可用, 则会自动选择其它端口. 使用的端口可在 `~/.config/ssh-manager/server.port` 中找到.

#### 官方链接与资源
- **GitHub 仓库**: [Releases](https://github.com/realysy/ssh-config-manager-artifact/releases) | [Issues](https://github.com/realysy/ssh-config-manager-artifact/issues)
- **官方网站**: [主页](/zh/) | [文档](/zh/doc/) | [博客](/zh/blog/)
- **视频教程**: 查看我们的 YouTube 播放列表以获取功能演示.

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?si=UmHw3DIAww3djeL-&amp;list=PLLjcWHV7lBwo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>