---
title: "Release soon. Basic function has completed"
pubDate: 2026-05-11
---

The basic function of this tool has complete: 

![main page](@/assets/screenshots/main_page.png)

- Manage SSH connections in groups.
- Group file format keep exactly the same with `~/.ssh/config`, which means you can use `ssh` command to connect to the server.
- If you edit a config in `~/.ssh/config` using this tool, all fields and custom comments will be preserved, even if they are not supported by this software.
- Default group use `/etc/ssh/ssh_config` as the default configuration file.
- Custome groups files will be stored in a self-defined directory.
- SSH connection can be tested its connectivity.
- SSH connection can be connected through `wezterm`, which is a terminal emulator and should be installed on your system.
- All function above are tested pass.

Next:

- Internationalization: support English, Chinese, French, Italian, German
- A simple auth system.
