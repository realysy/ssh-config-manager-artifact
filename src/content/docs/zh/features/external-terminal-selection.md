---
title: "选择用于连接 SSH 的外部终端模拟器"
pubDate: 2026-08-19
order: 10100
description: "选择用于连接 SSH 的外部终端模拟器."
---

#### 前提条件
您必须在系统中安装想要连接的终端模拟器, 并确保其可执行路径已添加到系统的 `PATH` 环境变量中.
- **Windows**: 将终端的安装目录添加到 "环境变量" 中.
- **Linux/macOS**: 将路径添加到您的 `~/.bashrc` 或 `~/.zshrc` 文件中 (例如: `export PATH="/path/to/terminal:$PATH"`).

#### 自动检测与回退
软件会自动扫描支持的终端. 如果未安装或未检测到任何第三方终端 (如 WezTerm 或 Alacritty), 它将优雅地回退到系统默认终端, 如 Windows Terminal, Konsole 或 GNOME Terminal.

#### 纯本地终端
点击右上角终端选择下拉菜单旁边的按钮, 也支持打开一个纯本地终端窗口, 而不建立任何远程 SSH 连接.

#### 请求新终端支持
如果您需要支持当前列表中没有的特定终端模拟器, 请在我们的 GitHub 仓库中 [提交 Issue](https://github.com/realysy/ssh-config-manager-artifact/issues).