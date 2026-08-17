---
title: "如何创建一个 linux .desktop launcher 文件从开始菜单或桌面启动 SSH Config Manager 软件"
pubDate: 2026-08-17
tags: ["Linux", "launcher", "desktop", "icon", "start menu"]
description: "介绍了 Linux 平台创建 .desktop launch 文件从开始菜单启动SSH Config Manager 软件的步骤."
---

SSH Config Manager 以便携版形式提供编译好的压缩包，你可以直接从命令行启动：

```bash
cd /opt/ssh-config-manager/ssh_config_manager.dist/  # 假设这是你的解压位置
./ssh_config_manager
```


如果想创建一个图标双击启动：下载最新 linux release 解压根目录下有一个 `ssh-config-manager.desktop` 文件，内容如下：

```ini
[Desktop Entry]
Version=1.0
Type=Application
Name=SSH Config Manager
GenericName=SMGR - Terminal emulator & SSH Hosts/connections manager & SFTP
Comment=Manage SSH connections in groups via WebUI
Path=/opt/ssh-config-manager/ssh_config_manager.dist/
TryExec=/opt/ssh-config-manager/ssh_config_manager.dist/ssh_config_manager
Exec=/opt/ssh-config-manager/ssh_config_manager.dist/ssh_config_manager
Icon=/opt/ssh-config-manager/ssh_config_manager.dist/assets/icon.png
StartupNotify=true
Categories=System;TerminalEmulator;Network;Utility;Application;SSHClient;SFTP;
X-TerminalArgExec=--
X-TerminalArgTitle=--title
X-TerminalArgAppId=--class
X-TerminalArgDir=--working-directory
X-TerminalArgHold=--hold
```

修改其中`Path`、`TryExec`、`Exec`、`Icon`的路径为你的解压位置。

然后添加可执行权限、拷贝到菜单目录：

```bash
chmod +x /opt/ssh-config-manager/ssh_config_manager.dist/ssh_config_manager
chmod +x ssh-config-manager.desktop
cp ssh-config-manager.desktop ~/.local/share/applications/
```

然后在系统的开始菜单即可搜索到，并能够点击图标启动。

![开始菜单的启动图标](@/assets/blog_assets/desktop-launcher-of-ssh-config-manager.png)
