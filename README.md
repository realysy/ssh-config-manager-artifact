# SSH Config Manager

SSH Config Manager: A tool for group-based visual management of SSH connection information, capable of integrating with modern terminal emulators and system built-in terminals, eliminating the need to memorize connection host names/addresses/shortcuts.

## ✨ Key Features

- Group-based visual SSH management, no need to memorize SSH names/addresses/shortcuts in the terminal.

    - Add/edit SSH connection information and create groups through webui, click to connect and establish SSH connections in local terminal emulator.
    - ~/.ssh/config is the default group, other group configuration files follow the exact same format, enabling easy migration and reuse in other tools, such as manual use with `ssh` command: `ssh -F ~/my_ssh_config/test_group.config my_host`.

- Supports multiple terminal emulators without changing your terminal usage habits.
    
    Supports invoking installed modern terminal emulators such as Wezterm, Alacritty, Kitty, as well as system terminals like Windows Terminal, GNOME Terminal, KDE Konsole to establish SSH connections.

    |               Terminal Emulator                                   | Windows| Linux | macOS|
    |                 :---                                               | :---: | :---: | :---:|
    | [Wezterm](https://wezterm.org/)                                    |   ✅  |   ✅  |  ❔  |
    | [Alacritty](https://alacritty.org/)                                |   ✅¹ |   ✅¹ |  ❔  |
    | [Kitty](https://github.com/kovidgoyal/kitty)                       |   ➖  |   ✅¹ |  ❔  |
    | [Windows Terminal](https://github.com/microsoft/terminal)          |   ✅  |   ➖  |  ➖  |
    | [Konsole](https://konsole.kde.org/)                                |   ✅¹ |   ✅² |  ❔  |   
    | [GNOME Terminal](https://help.gnome.org/gnome-terminal/index.html) |   ➖  |   ✅¹ |  ➖  |
    | [iTerm2](https://iterm2.com/)                                      |   ➖  |   ➖  |  ❔  |

    - ✅: Tested and fully supports designed features. When clicking to connect, if a terminal window is already open, it will automatically establish the SSH connection in a new tab; if no window exists, a new window will be created.
    - ✅¹: Tested, can successfully launch terminal and establish SSH connection, but only supports creating connections in new windows, not in new tabs of existing windows.
    - ✅²: Tested, can successfully launch terminal and establish SSH connection, but defaults to creating connections in new windows only.

        - Konsole: By enabling "Run all Konsole windows in a single process" in Konsole Settings → Configure Konsole (Ctrl+Shift+,) → General, you can establish connections in new tabs.

    - ❔: Not tested.
    - ➖: This terminal is not supported on this platform. I don't have a macOS device to test these terminals on. If you do and are willing to help out, please open an issue.
    - For unsupported terminals, clicking connect will copy the SSH connection command to clipboard, which you can manually paste into your terminal emulator.

## 🚀 Usage: Installation and Running

- Download: [Github releases](https://github.com/ssh-config-manager/ssh-config-manager/releases)

    SSH Config Manager is a cross-platform application supporting the following platforms:

    - x86_64: Windows, Linux, macOS.
    - arm64: macOS.

    Where:

    - Windows minimum supported version is Windows 10 (Windows 7 can be tried).
    - Linux minimum supported version requires glibc 2.31, such as Ubuntu 20.04, Debian 11.
    - macOS minimum supported version is macOS 11 (Big Sur).

- Extract and run: `ssh-config-manager`
- After running, it will automatically open the browser webui: http://localhost:18323, if port 18323 is unavailable, it will automatically select another port.

    The port used can be found at ~/.config/ssh-manager/server.port. If you accidentally close the webui interface, you can find the current port through this file.

## 📊 Performance

Compared to Electron applications, the backend service of this software has lower memory usage, comparable to C++ software:

- Win11 (24GB RAM): 39.1MB
- Ubuntu 20.04 (32GB RAM): 84.2MB

## 💎 Pricing

- 30-day free trial, after the trial period ends, you can pay to continue using, or take your created SSH connections and group data with you in a universal format for easy migration to other software.
- Currently in limited-time promotional phase: One-time payment of $28.9 for a 10-year valid activation code, with continuous updates during the validity period. After the promotional phase ends, the validity period may be shortened to 5 years. The promotional period is not yet determined, so if it meets your needs, it's recommended to purchase soon.
- Software supports both online activation and offline activation without internet access.
- To prevent activation keys from being publicly shared and abused, activation codes are bound to devices during activation, with email support available for unbinding.
- This software offers Purchasing Power Parity discounts to support users in emerging regions, with approximately 55% discount available through Taobao purchase.

## 🔧 Known Issues & Roadmap

- [ ] Data security: Add backup functionality, backup on each startup, only backup on first startup for multiple launches on the same day, keep up to ten backups, backup data stored under WEBUI_CONFIG_DIR/.bak/
- [ ] Implement update checking/auto-update functionality (using pyupdater or implementing simple version checking)
- [ ] Write documentation: Privacy Policy, Terms of Use, Usage Guide, Purchase & Activation
- [ ] Upload release files to artifact public repository
- [ ] Linux desktop operation
- [ ] Rust refactoring: May not be necessary, Rust's benefits include easier cross-platform support and faster compilation, but compilation is transparent to users; also Python packaged compressed files are only 20-30MB, not very large

## 📋 Compliance

### [Privacy Policy](./privacy.html)

### [Terms of Use](./terms.html)
