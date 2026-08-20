---
title: "选择用于连接 SSH 的外部终端模拟器"
pubDate: 2026-08-19
order: 10100
description: "了解如何使用 SSH Config Manager (SMGR) 连接 WezTerm, Alacritty, Windows Terminal 等您偏好的外部终端模拟器."
---

SSH Config Manager 支持跨平台及多种终端模拟器, 无需改变您的终端使用习惯.

| 终端模拟器 | Windows | Linux | macOS |
| :--- | :---: | :---: | :---: |
| [Wezterm](https://wezterm.org/) | ✅ | ✅ | ❔ |
| [Alacritty](https://alacritty.org/) | ✅¹ | ✅¹ | ❔ |
| [Kitty](https://github.com/kovidgoyal/kitty) | ➖ | ✅¹ | ❔ |
| [Windows Terminal](https://github.com/microsoft/terminal) | ✅ | ➖ | ➖ |
| [Konsole](https://konsole.kde.org/) | ✅¹ | ✅² | ❔ |
| [GNOME Terminal](https://help.gnome.org/gnome-terminal/index.html) | ➖ | ✅¹ | ➖ |
| [iTerm2](https://iterm2.com/) | ➖ | ➖ | ❔ |

## 图例说明

- ✅: 测试通过且完全支持设计功能. 自动在新标签页或新窗口建立连接.
- ✅¹: 测试通过, 但仅支持在新窗口建立连接.
- ✅²: 测试通过, 默认只能在新窗口建立连接. (Konsole: 在设置中启用"在单个进程中运行所有 Konsole 窗口"即可使用标签页).
- ❔: 未测试.
- ➖: 该平台不支持此终端.

## 前提条件

您必须在系统中安装想要连接的终端模拟器, 并确保其可执行路径已添加到系统的 `PATH` 环境变量中.
- **Windows**: 将终端的安装目录添加到 "环境变量" 中.
- **Linux/macOS**: 将路径添加到您的 `~/.bashrc` 或 `~/.zshrc` 文件中 (例如: `export PATH="/path/to/terminal:$PATH"`).

## 自动检测与回退

软件会自动扫描支持的终端. 如果未安装或未检测到任何第三方终端 (如 WezTerm 或 Alacritty), 它将优雅地回退到系统默认终端, 如 Windows Terminal, Konsole 或 GNOME Terminal.

## 纯本地终端

点击右上角终端选择下拉菜单旁边的按钮, 也支持打开一个纯本地终端窗口, 而不建立任何远程 SSH 连接.

## 请求新终端支持

如果您需要支持当前列表中没有的特定终端模拟器, 请在我们的 GitHub 仓库中 [提交 Issue](https://github.com/realysy/ssh-config-manager-artifact/issues).