This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. 主要会用到两个库 `@hubbleprotocol/kamino-lending-sdk` 和 `@hubbleprotocol/kamino-sdk`，`@hubbleprotocol/kamino-lending-sdk` 主要
   负责 DApp 里面的 Borrow/Lend, Long/Short, Multiply 模块，`@hubbleprotocol/kamino-sdk` 主要负责 Liquidity 模块

2. `@hubbleprotocol/kamino-lending-sdk` 目前我通过这个库实现了 Borrow/Lend 里面的操作(对应代码在 `lending.ts`)，这个库没找到 github 仓库，只在 npm 主页找到了一些文档，示例代码还是错的，需要用我在 `lending.ts` 里边用的方法来发交易，初始化 market 对象

3. `@hubbleprotocol/kamino-sdk` 我通过这个库实现了 Liquidity 里面的操作(`liquidity.ts`)，这个发交易主要是需要 Pool Address 和 对应的 Strategy Address，SDK 和 kamino 提供的 open Api 里面都有对应的方法，例如 `getRaydiumPoolsForTokens` `https://api.hubbleprotocol.io/strategies/enabled?env=mainnet-beta`，我测试用的 `SOL-USDC` Raydium Pool，偶尔发成功过一两次交易，大部分是失败，还得找下原因
