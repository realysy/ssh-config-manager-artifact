---
title: "Select External Terminal Emulator for SSH Connection"
pubDate: 2026-08-19
order: 10100
description: "Select external terminal emulator for SSH Connection."
---

#### Prerequisites
You must install the desired terminal emulator on your system and ensure its executable path is added to the system `PATH` environment variable.
- **Windows**: Add the terminal's installation directory to "Environment Variables".
- **Linux/macOS**: Add the path to your `~/.bashrc` or `~/.zshrc` file (e.g., `export PATH="/path/to/terminal:$PATH"`).

#### Auto-Detection & Fallback
The software automatically scans for supported terminals. If no third-party terminals (like WezTerm or Alacritty) are installed or detected, it will gracefully fall back to system defaults such as Windows Terminal, Konsole, or GNOME Terminal.

#### Pure Local Terminal
Clicking the button next to the terminal selection dropdown in the top right corner allows you to open a pure local terminal window without establishing any remote SSH connection.

#### Request New Terminals
If you need support for a specific terminal emulator not currently listed, please [submit an issue](https://github.com/realysy/ssh-config-manager-artifact/issues) on our GitHub repository.