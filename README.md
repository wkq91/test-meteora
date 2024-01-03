This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. 主要会用到两个库 `@hubbleprotocol/kamino-lending-sdk` 和 `@hubbleprotocol/kamino-sdk`，`@hubbleprotocol/kamino-lending-sdk` 主要
   负责 DApp 里面的 Borrow/Lend, Long/Short, Multiply 模块，`@hubbleprotocol/kamino-sdk` 主要负责 Liquidity 模块

2. `@hubbleprotocol/kamino-lending-sdk` 目前我通过这个库实现了 Borrow/Lend 里面的操作(对应代码在 `lending.ts`)，这个库没找到 github 仓库，只在 npm 主页找到了一些文档，示例代码还是错的，需要用我在 `lending.ts` 里边用的方法来发交易，初始化 market 对象

```
// 取数据
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

```

```
// 构造发交易
  const action = await KaminoAction.buildRepayTxns(
    market,
    getChainAmount(amount, symbol) + "",
    reserveMint,
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );

```

3. `@hubbleprotocol/kamino-sdk` 我通过这个库实现了 Liquidity 里面的操作(`liquidity.ts`)，这个发交易只需要 Strategy Address，就可以构造对应的 deposit 操作

测试发现有个坑:Pool 里面的两个 token 假如 decimal 不一样（例如 SOL-USDC），就会失败，后面测试 bSOL-SOL 的 Pool 成功了(https://app.kamino.finance/liquidity/7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5)，应该是 SDK 里面处理 decimal 有问题

```
   //  初始化
  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

   ...
   ...

   // 构造单Deposit的交易
    let depositIx = await kamino.deposit(
    new PublicKey(stragegyAddress),
    amounts[0],
    new Decimal(Number(amounts[1]) * 1),
    trader.publicKey
  );

  // 构造withdraw全部share的交易
  const withdrawIx = await kamino.withdrawAllShares(
    strategyWithAddres,
    trader.publicKey
  );
```
