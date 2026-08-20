---
title: "Installation"
pubDate: 2026-08-18
order: 10100
description: "Install instruction of SSH Config Manager (SMGR), cross-platform support: Windows, Linux, macOS."
---

SSH Config Manager is distributed as a portable archive. You can download the latest version directly from [GitHub Releases](https://github.com/realysy/ssh-config-manager-artifact/releases).

#### System-Specific Launch Instructions
- **Windows**: Simply extract the archive and run `ssh-config-manager.exe`.
- **Linux**: After extracting, you may want to create a `.desktop` file for easy launching from your application menu. Ensure the executable has execute permissions (`chmod +x ssh-config-manager`).
- **macOS**: Due to Gatekeeper, you may need to right-click the application and select "Open", or run `chmod +x ssh-config-manager` in the terminal on first launch to bypass the security warning.

#### After Running
The software will automatically open the browser WebUI at [http://localhost:18323](http://localhost:18323). If port 18323 is unavailable, it will automatically select another port. The port used can be found at `~/.config/ssh-manager/server.port`.

#### Official Links & Resources
- **GitHub Repository**: [Releases](https://github.com/realysy/ssh-config-manager-artifact/releases) | [Issues](https://github.com/realysy/ssh-config-manager-artifact/issues)
- **Official Website**: [Home](/) | [Documentation](/doc/) | [Blog](/blog/)
- **Video Tutorials**: Check out our YouTube playlist for feature demonstrations.

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?si=UmHw3DIAww3djeL-&amp;list=PLLjcWHV7lBwo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>