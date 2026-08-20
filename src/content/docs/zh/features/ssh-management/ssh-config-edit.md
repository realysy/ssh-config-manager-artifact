---
title: "SSH 配置编辑"
pubDate: 2026-08-18
order: 10000
description: "使用 SSH Config Manager (SMGR) 编辑 SSH 配置: 创建, 添加, 删除, 修改等."
---

## 支持的字段

GUI 支持编辑常用的 SSH 主机字段, 如 `HostName`, `User`, `Port` 和 `IdentityFile`.

对于 GUI 当前未支持的字段, 您可以手动编辑配置文件. 手动添加的字段在连接时完全有效且可用. 常见的手动添加字段示例包括:
- `ProxyJump`: 用于通过堡垒机连接.
- `LocalForward` / `RemoteForward`: 用于端口转发.
- `ServerAliveInterval`: 用于保持连接活跃.

## 支持的操作

添加 SSH 主机后, 您可以直接从界面执行多种操作:
- **测试连接**: 验证网络可达性和身份验证.
- **连接外部终端**: 在您首选的本地终端模拟器中启动连接.
- **文件管理**: 打开内置的 SFTP 文件管理器.
- **SSH 编辑**: 修改主机配置.
- **移动 / 复制 / 删除**: 组织或移除主机条目.

![SSH 连接编辑页面](@/assets/screenshots/zh/SSH_edit.png)