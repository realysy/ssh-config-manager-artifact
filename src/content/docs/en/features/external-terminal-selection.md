---
title: "Select External Terminal Emulator for SSH Connection"
pubDate: 2026-08-19
order: 10100
description: "Select external terminal emulator for SSH Connection."
---

SSH Config Manager is cross-platform and supports multiple terminal emulators without changing your terminal usage habits.

| Terminal Emulator | Windows | Linux | macOS |
| :--- | :---: | :---: | :---: |
| [Wezterm](https://wezterm.org/) | ✅ | ✅ | ❔ |
| [Alacritty](https://alacritty.org/) | ✅¹ | ✅¹ | ❔ |
| [Kitty](https://github.com/kovidgoyal/kitty) | ➖ | ✅¹ | ❔ |
| [Windows Terminal](https://github.com/microsoft/terminal) | ✅ | ➖ | ➖ |
| [Konsole](https://konsole.kde.org/) | ✅¹ | ✅² | ❔ |
| [GNOME Terminal](https://help.gnome.org/gnome-terminal/index.html) | ➖ | ✅¹ | ➖ |
| [iTerm2](https://iterm2.com/) | ➖ | ➖ | ❔ |

## Legend
- ✅: Tested and fully supports designed features. Automatically establishes SSH in a new tab if window exists, or creates a new window.
- ✅¹: Tested, can successfully launch terminal, but only supports creating connections in new windows.
- ✅²: Tested, defaults to creating connections in new windows only. (Konsole: Enable "Run all Konsole windows in a single process" in Settings to use tabs).
- ❔: Not tested.
- ➖: Not supported on this platform.

## Prerequisites
You must install the desired terminal emulator on your system and ensure its executable path is added to the system `PATH` environment variable.
- **Windows**: Add the terminal's installation directory to "Environment Variables".
- **Linux/macOS**: Add the path to your `~/.bashrc` or `~/.zshrc` file (e.g., `export PATH="/path/to/terminal:$PATH"`).

## Auto-Detection & Fallback
The software automatically scans for supported terminals. If no third-party terminals (like WezTerm or Alacritty) are installed or detected, it will gracefully fall back to system defaults such as Windows Terminal, Konsole, or GNOME Terminal.

## Pure Local Terminal
Clicking the button next to the terminal selection dropdown in the top right corner allows you to open a pure local terminal window without establishing any remote SSH connection.

## Request New Terminals
If you need support for a specific terminal emulator not currently listed, please [submit an issue](https://github.com/realysy/ssh-config-manager-artifact/issues) on our GitHub repository.