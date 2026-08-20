---
title: "WezTerm 终端模拟器 - 跨平台 高性能 多功能 易用"
pubDate: 2026-08-14
tags: ["WezTerm", "终端模拟器", "终端", "SSH", "配置"]
description: "WezTerm 终端模拟器安装与配置指南, 包含跨平台动态 Tab 标题设置, 工作目录上报以及 Lua 配置文件详解."
---

## Wezterm 主要特性

- 支持 Windows/Linux
- 拆分 pane 之后可通过鼠标拖拽 pane 的边界线调整大小

  - 可右击标签页加号拆分，如下图；
  - 也可快捷键拆分：`ctrl+shift+alt+%` 水平拆分(左右), `ctrl+shift+alt+"` 垂直拆分(上下)
- 支持保存 / 恢复 layout 和 session

  两种方法：

  - 内置多路复用（Unix Domain，需要在服务器端安装wezterm配合）+ 命令行/右击菜单
  - lua 插件-恢复之前的状态：[https://github.com/MLFlexer/resurrect.wezterm](https://github.com/MLFlexer/resurrect.wezterm)

![Wezterm 界面截图](@/assets/blog_assets/wezterm-screenshots.png)

## 安装

wezterm-nightly.Ubuntu20.04.deb 31M

- 运行wezterm `Ctrl+shift+L` 会warn：WARN window::os::x11::connection > Unable to resolve appearance using xdg-desktop-portal: get_appearance.read_setting: Reading xdg-portal org.freedesktop.appearance color-scheme: org.freedesktop.portal.Error.NotFound: Requested setting not found，忽略即可，这是因为ubuntu 20.04 中的xdg包太旧了。

## Wezterm 配置

如下两个文件需配套使用，主要设置了内容见 ~/.wezterm.lua, 包括但不限于：

- Windows 使用 msys2 bash。
- 在 Wezterm tab 标题中显示当前路径和正在运行的命令，跨平台支持。

### `~/.wezterm.lua`

- [https://wezterm.org/config/lua/config/](https://wezterm.org/config/lua/config/)
- [https://wezterm.org/config/files.html](https://wezterm.org/config/files.html)
- [修复设置半透明之后Windows NVIDIA GPU渲染出现花点的问题](https://github.com/wezterm/wezterm/issues/6111#issuecomment-4318595890)
- `Ctrl+Shift+L`进入调试窗口，可查看日志：`wezterm.log_info("CWD:", cwd, "HOME:", wezterm.home_dir)`

```lua
-- ~/.wezterm.lua
local wezterm = require("wezterm")
local config = wezterm.config_builder()

-- ######################## 获取系统信息 ########################
local os_name = wezterm.target_triple
local hostname = wezterm.hostname()
local username = wezterm.default_prog and os.getenv("USERNAME") or os.getenv("USER")
local home_dir = wezterm.home_dir
if not username then
  local home = home_dir or ""
  username = home:match("[/\\]([^/\\]+)$")
end
wezterm.log_info("os_name:", os_name, "hostname:",hostname, 
    "username:",username, "home_dir:", home_dir)


-- ######################## 默认终端 ########################
local is_windows = os_name:find("windows") ~= nil
if is_windows then
  config.default_prog = { "C:/msys64/usr/bin/bash.exe", "--login", "-i" }
  config.set_environment_variables = { MSYSTEM = "UCRT64", CHERE_INVOKING = "1" }
  config.window_background_opacity = 0.80
  config.prefer_egl = true  -- 消除花屏，内存 +21MB
else
  config.default_prog = { "/bin/zsh", "--login" }
  config.window_background_opacity = 0.80
end

-- ######################## 性能 & 高刷 ########################
-- 默认"OpenGL"内存低; "WebGpu"会使内存从60M增加到210M; "Software"是CPU
config.front_end = "OpenGL"
config.max_fps = 60
config.animation_fps = 60
config.scrollback_lines = 10000

-- ######################## 外观 & 性能 ########################
config.font = wezterm.font("Maple Mono SC NF")
config.font_size = 12
config.line_height = 1.1
config.cell_width = 1.0

config.use_fancy_tab_bar = true
config.tab_bar_at_bottom = false
config.show_tabs_in_tab_bar = true
config.hide_tab_bar_if_only_one_tab = false
config.tab_max_width = 24

config.enable_scroll_bar = true
config.window_padding = { left = 12, right = 12, top = 10, bottom = 10 }

-- ######################## 路径处理 #############################
-- TODO: 进入 wsl/ssh 之后无法正确获取当前路径，获取的cwd一直是进wsl之前的windows路径---我注意到wezterm window title是可以获取到正确路径的
local function get_folder_name(cwd)
  wezterm.log_info("cwd:", cwd)
  if not cwd or cwd == "" then return "?" end
  local path = tostring(cwd)
    :gsub("^file://+", "")      -- 移除协议头
    :gsub("\\", "/")            -- 统一分隔符
    :gsub("/+$", "")            -- 移除尾部斜杠
  
  -- 主目录缩写
  if path == home_dir or path == home_dir:gsub("\\", "/") then
    return "~"
  end
  
  -- msys2 根目录修复
  if hostname == "tom" and username == "jack" and 
        is_windows and path == "E:/msys64" then
    return "/"
  end

  -- 提取最后一层文件夹
  return path:match("/([^/]+)$") or path:match("^%w:/(.*)$") or path
end

-- ######################## Tab 标题格式化（高效版） ########################
wezterm.on("format-tab-title", function(tab)
  local pane = tab.active_pane
  local folder = get_folder_name(pane.current_working_dir)
  
  -- 读取 Shell 上报的命令名（唯一可靠来源）
  local cmd = (pane.user_vars or {}).WEZTERM_PROC
  if cmd and cmd ~= "" and cmd:lower():match("^bash$") == nil then
    -- 限制长度 + 拼接
    if #cmd > 10 then cmd = cmd:sub(1, 8) .. "…" end
    return string.format("%d: %s › %s", tab.tab_index + 1, folder, cmd)
  end
  
  -- 无命令时仅显示文件夹
  return string.format("%d: %s", tab.tab_index + 1, folder)
end)

return config
```

### `~/.wezterm.sh`

创建如下文件，并在 shell 中 source:

```bash
# 加载 WezTerm Tab 标题集成模块
[ -f "$HOME/.wezterm.sh" ] && source "$HOME/.wezterm.sh"
```

- 注意：换行符可能导致source失败。

```sh
# ~/.wezterm.sh - WezTerm 动态 Tab 标题（命令名 + 工作目录上报）
# 兼容 Bash & Zsh，适配 msys2 / WSL / SSH 等环境
[[ $- == *i* || -o interactive ]] || return 0
[[ -n "$ZSH_VERSION" || -n "$BASH_VERSION" ]] || return 0
[[ -n "${__WEZTERM_LOADED:-}" ]] && return 0
__WEZTERM_LOADED=1

# ========== 上报当前命令名 ==========
__wezterm_send() {
  local cmd="${1%% *}"
  [[ -z "$cmd" || "$cmd" == history || "$cmd" == __wezterm_* || "$cmd" == _wezterm_* ]] && return
  [[ "$cmd" == "$__WEZTERM_LAST" ]] && return
  __WEZTERM_LAST="$cmd"
  printf '\033]1337;SetUserVar=WEZTERM_PROC=%s\007' "$(printf '%s' "$cmd" | base64 | tr -d '\n')"
}

# ========== 上报当前工作目录（OSC 7） ==========
__wezterm_update_cwd() {
  # 缓存本机 / 远程主机名
  if [[ -z "$__WEZTERM_HOST" ]]; then
    __WEZTERM_HOST="${HOSTNAME:-$(hostname 2>/dev/null)}"
    [[ -z "$__WEZTERM_HOST" ]] && __WEZTERM_HOST="localhost"
  fi

  local cwd="$PWD"
  [[ "$cwd" == "$__WEZTERM_LAST_DIR" ]] && return
  __WEZTERM_LAST_DIR="$cwd"

  local url_path
  local uname_s
  uname_s=$(uname -s 2>/dev/null)

  # 情况1: msys2 / Cygwin → 转换成 Windows 路径
  if [[ -n "$MSYSTEM" ]] || [[ "$uname_s" =~ (MINGW|MSYS|CYGWIN) ]]; then
    local win_path
    if win_path=$(pwd -W 2>/dev/null); then
      win_path="${win_path//\\//}"
    elif win_path=$(cygpath -w "$PWD" 2>/dev/null); then
      win_path="${win_path//\\//}"
    else
      win_path="$PWD"   # 极其罕见的 fallback
    fi
    url_path="file://${__WEZTERM_HOST}/${win_path}"

  # 情况2: WSL → 转换成 Windows 可理解的 UNC 路径
  elif [[ -n "$WSL_DISTRO_NAME" ]] || grep -qi microsoft /proc/version 2>/dev/null; then
    local win_path
    if win_path=$(wslpath -w "$PWD" 2>/dev/null); then
      win_path="${win_path//\\//}"
      url_path="file://${__WEZTERM_HOST}/${win_path}"
    else
      url_path="file://${__WEZTERM_HOST}${PWD}"
    fi

  # 情况3: 纯 Linux / SSH 远程主机 → 直接使用 Unix 路径
  else
    url_path="file://${__WEZTERM_HOST}${PWD}"
  fi

  printf '\033]7;%s\033\\' "$url_path"
}

# ========== 清空命令、触发目录更新（提示符前） ==========
__wezterm_clear() {
  __WEZTERM_LAST=""
  printf '\033]1337;SetUserVar=WEZTERM_PROC=\007'
  __wezterm_update_cwd
}

# ========== 根据当前 Shell 挂载钩子 ==========
if [[ -n "$ZSH_VERSION" ]]; then
  autoload -Uz add-zsh-hook
  add-zsh-hook preexec __wezterm_send
  add-zsh-hook precmd __wezterm_clear

elif [[ -n "$BASH_VERSION" ]]; then
  __WEZTERM_LOCK=0
  __wezterm_bash_debug() {
    [[ $__WEZTERM_LOCK -eq 1 ]] && return
    __WEZTERM_LOCK=1
    case "$BASH_COMMAND" in
      ""|history|PROMPT_COMMAND|__wezterm_*|_wezterm_*) ;;
      *) __wezterm_send "$BASH_COMMAND" ;;
    esac
    __WEZTERM_LOCK=0
  }
  trap '__wezterm_bash_debug' DEBUG

  if [[ "$(declare -p PROMPT_COMMAND 2>/dev/null)" == "declare -a"* ]]; then
    PROMPT_COMMAND+=(__wezterm_clear)
  else
    PROMPT_COMMAND="${PROMPT_COMMAND:+$PROMPT_COMMAND;}__wezterm_clear"
  fi
fi
```


## wezterm cli 常用命令

在安装 wezterm 并添加到 PATH 之后，你就可以在其他终端模拟器中调用 `wezterm` 命令，也可以在wezterm 内调用此命令。

### 新建 wezterm 窗口新建 ssh 连接

```bash
# 方法1：调用的是你系统里传统的 ssh 命令
# 但是这样建立的pane，在拆分后不会自动连接
$ wezterm start -- ssh my_host

# 方法2：使用的是 WezTerm 内建的 SSH 客户端
# https://github.com/wezterm/wezterm/blob/main/docs/ssh.md
# 效果1: 拆分pane/新建tab后，能自动建立原ssh连接
# 效果2: 非持久, 网络中断后连接会被关闭
# 效果2: 似乎无法通过1.2中的cli命令在此窗口打开新的ssh连接
$ wezterm ssh my_host
```

### 在已有 wezterm 窗口新建 ssh 连接

> 此功能需要开启 wezterm 多路复用
>
> ```lua
> -- ~/.wezterm.lua
> local wezterm = require("wezterm")
> local config = wezterm.config_builder()
>
> -- 启用本地多路复用 (win也支持)
> config.unix_domains = { { name = 'unix' } }
>
> return config
> ```


```bash
# 方法1: start --new-tab
$ wezterm start --new-tab -- ssh my_host
13:34:37.166  INFO   wezterm_gui > Spawned your command via the existing GUI instance. Use wezterm start --always-new-process if you do not want this behavior. Result=SpawnResponse { tab_id: 1, pane_id: 1, window_id: 0, size: TerminalSize { rows: 20, cols: 80, pixel_width: 800, pixel_height: 460, dpi: 96 } }
```

- 方法1 在 windows 中可以运行，但不会在 new-tab 新标签页打开连接，而是打开了 wezterm 新窗口


```bash
# 方法2: cli spawn, 输出的是新建的pane id, 从0开始，表示当前是第几个pane
# 测试
$ wezterm cli spawn -- ssh my_host
2
```

- 方法2 windows 中默认配置不可用, 报错 ERROR  wezterm > failed to connect to Socket("gui-sock-22124"): connecting to gui-sock-22124; terminating
