This should be mine second use of github action. I don't remember when is the first time. just remembering that at that time, I didn't know many things of this workflow. But at this time, I believe I roughly understand the overal workflow of github action.

There two main benefits that github action brings to me:

1. Compile from source code to binaries, so users don't have to compile themselves or install dependencies. They can just download and run - if everything works as expected.
2. Multi-platform compile, including Windows, Linux, MacOS (arm & x86), so I don't have to setup cross-compile toolchain in my own machine. First that is pretty complex, and secondly, LLM tell me that one have to use Apple SDK on Apple hardware, which is required by its license, so you have to buy or rent a mac hardware, or use github action like free service.

The only problem is for private repo, github action's free quota is really small.