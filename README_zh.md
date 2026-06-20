# SSH Config Manager 源码项目

SSH Config Manager: 一个用于分组可视化管理 SSH 连接信息的工具, 能够和现代终端模拟器以及系统内置终端联动, 无需记忆连接名称/地址/快捷键. 

## ✨ 主要功能

- 分组可视化管理SSH, 无需在终端内记忆 SSH 名称/地址/快捷键等信息. 

    - 可通过 webui 添加/编辑 SSH 连接信息, 创建分组, 点击连接即可在本地终端模拟器中建立 SSH 连接. 
    - ~/.ssh/config 是默认分组, 其它分组的配置文件格式与之完全相同, 可在其它工具迁移复用, 如在 `ssh` 命令中手动使用：`ssh -F ~/my_ssh_config/test_group.config my_host`. 

- 支持多种终端模拟器, 无需改变你的终端使用习惯. 
    
    支持调用系统内安装的 Wezterm、Alacritty、Kitty 等现代终端模拟器以及 Windows Terminal、GNOME Terminal、KDE Konsole 等系统终端建立 SSH 连接

    |               终端模拟器                                          | Windows| Linux | macOS|
    |                 :---                                               | :---: | :---: | :---:|
    | [Wezterm](https://wezterm.org/)                                    |   ✅  |   ✅  |  ❔  |
    | [Alacritty](https://alacritty.org/)                                |   ✅¹ |   ✅¹ |  ❔  |
    | [Kitty](https://github.com/kovidgoyal/kitty)                       |   ➖  |   ✅¹ |  ❔  |
    | [Windows Terminal](https://github.com/microsoft/terminal)          |   ✅  |   ➖  |  ➖  |
    | [Konsole](https://konsole.kde.org/)                                |   ✅¹ |   ✅² |  ❔  |   
    | [GNOME Terminal](https://help.gnome.org/gnome-terminal/index.html) |   ➖  |   ✅¹ |  ➖  |
    | [iTerm2](https://iterm2.com/)                                      |   ➖  |   ➖  |  ❔  |

    - ✅：测试通过且完全支持设计功能. 点击连接时, 如果已有该终端窗口打开, 会自动在新标签页中建立 SSH 连接; 若无窗口则新建窗口. 
    - ✅¹：测试通过, 可成功启动终端并建立 SSH 连接, 但仅支持在新窗口建立连接, 不支持在已有窗口中新建标签页. 
    - ✅²：测试通过, 可成功启动终端并建立 SSH 连接, 但默认只能在新窗口建立连接. 

        - Konsole：在 Konsole 设置 → 配置 Konsole (Ctrl+Shift+,) → 常规中启用"在单个进程中运行所有 Konsole 窗口", 即可在新标签页中建立连接. 

    - ❔：未测试. 
    - ➖：该平台不支持此终端. 我没有 macOS 设备来测试这些终端. 如果您有且愿意帮助测试, 请提交 issue. 
    - 对于不支持的终端, 点击连接后会拷贝 SSH 连接命令到剪贴板, 可以手动粘贴到终端模拟器中执行. 

## 🚀 使用方法：安装运行

- 下载：[Github releases](https://github.com/ssh-config-manager/ssh-config-manager/releases)

    SSH Config Manager 是一个跨平台应用, 支持以下平台：

    - x86_64：Windows、Linux、macOS. 
    - arm64：macOS. 

    其中：

    - Windows 最低支持到 Windows 10（Windows 7 可尝试）. 
    - Linux 最低支持到 glibc 2.31, 如 Ubuntu 20.04、Debian 11. 
    - macOS 最低支持到 macOS 11 (Big Sur). 

- 解压运行：`ssh-config-manager`
- 运行后会自动打开浏览器 webui：http://localhost:18323, 若 18323 端口不可用会自动选择其他端口. 

    使用的端口见 ~/.config/ssh-manager/server.port. 如果您不小心关闭了 webui 界面, 可通过这个文件找到当前使用的端口. 

## 📊 性能

与 Electron 应用相比, 本软件的后台服务的内存占用较低, 和 C++ 软件相当：

- Win11 (24GB RAM)：39.1MB
- Ubuntu 20.04 (32GB RAM)：84.2MB

## 💎 定价与购买

- 30天免费试用, 试用期结束后可以付费继续使用, 也可以带走您创建的 SSH 连接与分组数据, 通用格式方便迁移到其它软件. 
- 目前软件处于限时推广阶段：一次性付费 $28.9 可以获得 10 年有效期的激活码, 有效期内可获得持续更新. 限时推广阶段结束后, 可能缩短有效期为 5 年. 推广期限未定, 如果符合需求建议尽快购买. 
- 软件支持在线激活, 也支持无网环境离线激活. 
- 为了防止激活密钥被公开分享导致滥用, 激活时激活码会与设备绑定, 支持 email 联系客服解绑. 
- 本软件提供购买力平价折扣 (Purchasing Power Parity discounts) 以支持新兴地区的用户, 通过淘宝 Taobao 购买可以获得大约 55% 的折扣. 

购买途径: 软件主界面 - 右上角激活按钮 - 扫码购买.

 - 全球用户: 支持使用 PayPal, credit or debit card 购买, 无需注册账号, 购买后会直接显示激活码. 
 - 中国大陆用户: 可使用淘宝 Taobao 购买, 购买后联系淘宝客服获取激活码. 

## 🔧 已知问题 & 计划

- [ ] Linux desktop 运行
- [ ] Rust ：也许没有必要, Rust 的好处就是更方便的支持多端, 编译速度更快, 但是编译对用户来说是不可知的; 然后 python 打包压缩包也只有二三十兆, 并不是很大

## 📋 合规

### [隐私政策](./privacy.html)

### [使用条款](./terms.html)
