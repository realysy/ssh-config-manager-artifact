---
title: "使用 Github Action 进行 CI/CD"
pubDate: 2026-06-23
---

这应该是我第二次使用 GitHub Action。我不记得第一次是什么时候了，只记得那时对这个工作流的很多东西都不了解。但这一次，我相信我已经大致搞懂了 GitHub Action 的整体工作流程。

![Github Release Assets of this tool](@/assets/screenshots/github-action-assets.png)

GitHub Action 给我带来的主要好处有两个：

1. 从源代码编译为二进制文件，这样用户就无需自己编译或安装依赖。他们只需要下载并运行——如果一切按预期工作的话。
2. 多平台编译，包括 Windows、Linux、macOS（arm 和 x86），这样我就不用在自己的机器上搭建交叉编译工具链了。首先那非常复杂，其次，LLM 告诉我，由于许可证要求，在 Apple 硬件上必须使用 Apple SDK，所以你必须购买或租用 Mac 硬件，或者使用像 GitHub Action 这样的免费服务。

唯一的问题是，对于私有仓库，GitHub Action 的免费额度真的很少。
