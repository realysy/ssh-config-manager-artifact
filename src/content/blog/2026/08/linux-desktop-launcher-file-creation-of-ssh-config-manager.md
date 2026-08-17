---
title: "How to Create a Linux .desktop Launcher to Start SSH Config Manager from the Start Menu or Desktop?"
pubDate: 2026-08-17
tags: ["Linux", "launcher", "desktop", "icon", "start menu"]
description: "A step-by-step guide to creating a .desktop launcher file on Linux for launching SSH Config Manager from the start menu or desktop."
---

SSH Config Manager is distributed as a portable archive. You can launch it directly from the command line:

```bash
cd /opt/ssh-config-manager/ssh_config_manager.dist/  # Replace with your extraction path
./ssh_config_manager
```

To create a clickable launcher icon: [Download the latest Linux release](https://github.com/realysy/ssh-config-manager-artifact/releases/latest). The root directory of the extracted archive contains an `ssh-config-manager.desktop` file with the following content:

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

Update the `Path`, `TryExec`, `Exec`, and `Icon` paths to match your extraction location.

Then add execute permissions and copy the file to the menu directory:

```bash
chmod +x /opt/ssh-config-manager/ssh_config_manager.dist/ssh_config_manager
chmod +x ssh-config-manager.desktop
cp ssh-config-manager.desktop ~/.local/share/applications/
```

Now you can search for SSH Config Manager in your system's start menu and launch it with a single click.

![Launcher icon in start meun](@/assets/blog_assets/desktop-launcher-of-ssh-config-manager.png)
