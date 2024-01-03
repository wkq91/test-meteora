import { mainnetRpcUrl, trader } from "@/config";
import { getAssociatedTokenAddress } from "@hubbleprotocol/kamino-lending-sdk";
import {
  Kamino,
  StrategyWithAddress,
  assignBlockInfoToTransaction,
  collToLamportsDecimal,
  createTransactionWithExtraBudget,
  getAssociatedTokenAddressAndData,
  isSOLMint,
  sendTransactionWithLogs,
} from "@hubbleprotocol/kamino-sdk";
import {
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token03";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import Decimal from "decimal.js";

export async function singleSidedDepositToStrategy() {
  console.log("1111");

  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  const poolAddress = "2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv";
  const stragegyAddress = "CEz5keL9hBCUbtVbmcwenthRMwmZLupxJ6YtYAgzp4ex";

  const strategyState = await kamino.getStrategyByAddress(
    new PublicKey(stragegyAddress)
  );

  if (!strategyState) {
    console.error("strategy is null");
    return;
  }

  console.log("2222");

  let tx = createTransactionWithExtraBudget(12000000);
  const [sharesAta, sharesMintData] = await getAssociatedTokenAddressAndData(
    connection,
    strategyState.sharesMint,
    trader.publicKey
  );
  const [tokenAAta, tokenAData] = await getAssociatedTokenAddressAndData(
    connection,
    strategyState.tokenAMint,
    trader.publicKey
  );
  const [tokenBAta, tokenBData] = await getAssociatedTokenAddressAndData(
    connection,
    strategyState.tokenBMint,
    trader.publicKey
  );

  let strategyWithAddres = {
    address: new PublicKey(stragegyAddress),
    strategy: strategyState,
  };
  const ataInstructions =
    await kamino.getCreateAssociatedTokenAccountInstructionsIfNotExist(
      trader.publicKey,
      strategyWithAddres,
      tokenAData,
      tokenAAta,
      tokenBData,
      tokenBAta,
      sharesMintData,
      sharesAta
    );
  if (ataInstructions.length > 0) {
    tx.add(...ataInstructions);
    let createAtasRes = await sendTransactionWithLogs(
      connection,
      tx,
      trader.publicKey,
      [trader]
    );
    console.log("res createAtas ", createAtasRes);
  } else {
    console.log("ataInstructions empty");
  }

  // let swapper: SwapperIxBuilder = (
  //   input: DepositAmountsForSwap,
  //   tokenAMint: PublicKey,
  //   tokenBMint: PublicKey,
  //   user: PublicKey,
  //   slippageBps: Decimal
  // ) =>
  //   getLocalSwapIxs(
  //     input,
  //     tokenAMint,
  //     tokenBMint,
  //     user,
  //     slippageBps,
  //     trader.publicKey
  //   );

  const initialTokenBalances = await kamino.getInitialUserTokenBalances(
    trader.publicKey,
    strategyState.tokenAMint,
    strategyState.tokenBMint,
    undefined
  );
  console.log("initialTokenBalances a", initialTokenBalances.a.toString());
  console.log("initialTokenBalances b", initialTokenBalances.b.toString());

  let {
    instructions: singleSidedDepositIxs,
    lookupTablesAddresses: _lookupTables,
  } =
    // @ts-ignore
    await kamino.singleSidedDepositTokenA(
      new PublicKey(stragegyAddress),
      new Decimal(0.01),
      trader.publicKey,
      new Decimal(50),
      undefined
    );

  let singleSidedDepositTx = createTransactionWithExtraBudget(12000000);
  singleSidedDepositTx.add(...singleSidedDepositIxs);
  let txHash = await sendAndConfirmTransaction(
    kamino.getConnection(),
    singleSidedDepositTx,
    [trader],
    {}
  );

  // const increaseBudgetIx = createAddExtraComputeUnitsIx(1_200_000);
  // const depositIx = await kamino.getTransactionV2Message(
  //   trader.publicKey,
  //   [increaseBudgetIx, ...singleSidedDepositIxs],
  //   [strategyState.strategyLookupTable]
  // );
  // let singleSidedDepositTx = new VersionedTransaction(depositIx);
  // singleSidedDepositTx.sign([trader]);

  // @ts-ignore
  // let txHash = await sendAndConfirmTransaction(
  //   kamino.getConnection(),
  //   singleSidedDepositTx,
  //   undefined,
  //   {
  //     skipPreflight: true,
  //   }
  // );

  return txHash;
}

export async function depositLiquidityShares() {
  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  const orcaPools = await kamino.getOrcaPoolsForTokens(
    new PublicKey("So11111111111111111111111111111111111111112"),
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  );
  const raydiumPools = await kamino.getRaydiumPoolsForTokens(
    new PublicKey("So11111111111111111111111111111111111111112"),
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  );

  console.log({ orcaPools });
  console.log({ raydiumPools });

  orcaPools.sort((item1, item2) => {
    return Number(item2.tvl) - Number(item1.tvl);
  });

  raydiumPools.sort((item1, item2) => {
    return Number(item2.tvl) - Number(item1.tvl);
  });

  // const orcaFirstPool = orcaPools.length > 0 ? orcaPools[0] : null;
  // const raydiumFirstPool = raydiumPools.length > 0 ? raydiumPools[0] : null;

  // let finalPoolAddress =
  //   Number(orcaFirstPool?.tvl) > Number(raydiumFirstPool?.tvl)
  //     ? orcaFirstPool?.address
  //     : raydiumFirstPool?.id;

  let finalPoolAddress = raydiumPools[0].id;
  console.log({ finalPoolAddress });
  finalPoolAddress = "2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv";

  // const pool = await kamino.getWhirlpoolByAddress(
  //   new PublicKey(finalPoolAddress || "")
  // );
  const pool = await kamino.getRaydiumPoolByAddress(
    new PublicKey(finalPoolAddress || "")
  );
  if (!pool) {
    console.error("pool not found");
    return;
  }

  console.log(pool.tokenMint0.toString());
  console.log(pool.tokenMint1.toString());

  // const allStrategies = await kamino.getStrategies();
  // const matchedStrategy = allStrategies.find(
  //   (item) => item?.pool.toString() === poolAddress
  // );

  const strategiesRes = await fetch(
    "https://api.hubbleprotocol.io/strategies/enabled?env=mainnet-beta"
  );
  const apiStrategies = await strategiesRes.json();
  const matchedApiStrategies = apiStrategies.filter((item: any) => {
    return (
      item.tokenAMint === pool.tokenMint0.toString() &&
      item.tokenBMint === pool.tokenMint1.toString()
    );
  });
  console.log({ matchedApiStrategies });

  let matchedStrategy: StrategyWithAddress | null = null;
  for (let i = 0; i < matchedApiStrategies.length; i++) {
    const st = await kamino.getStrategyByKTokenMint(
      new PublicKey(matchedApiStrategies[i].shareMint)
    );
    console.log({ st });
    console.log("st pool", st?.strategy.pool.toString());
    if (st?.strategy.pool.toString() === finalPoolAddress) {
      matchedStrategy = st;
      break;
    }
  }

  console.log({ matchedStrategy });
  console.log(
    "strategy sharesMint:",
    matchedStrategy?.strategy.sharesMint.toString()
  );

  if (!matchedStrategy) {
    console.error("matchedApiStrategy not found");
    return;
  }

  // check if associated token addresses exist for token A, B and shares
  const [sharesAta, sharesMintData] = await getAssociatedTokenAddressAndData(
    connection,
    matchedStrategy.strategy.sharesMint,
    trader.publicKey
  );
  const [tokenAAta, tokenAData] = await getAssociatedTokenAddressAndData(
    connection,
    matchedStrategy.strategy.tokenAMint,
    trader.publicKey
  );
  const [tokenBAta, tokenBData] = await getAssociatedTokenAddressAndData(
    connection,
    matchedStrategy.strategy.tokenBMint,
    trader.publicKey
  );

  // add creation of associated token addresses to the transaction instructions if they don't exist
  const ataInstructions =
    await kamino.getCreateAssociatedTokenAccountInstructionsIfNotExist(
      trader.publicKey,
      matchedStrategy,
      tokenAData,
      tokenAAta,
      tokenBData,
      tokenBAta,
      sharesMintData,
      sharesAta
    );

  // create a transaction that has an instruction for extra compute budget (deposit operation needs this),
  let tx1 = createTransactionWithExtraBudget(1200000);
  if (ataInstructions.length > 0) {
    tx1.add(...ataInstructions);
  }

  // assign block hash, block height and fee payer to the transaction
  tx1 = await assignBlockInfoToTransaction(connection, tx1, trader.publicKey);
  const txHash1 = await sendAndConfirmTransaction(connection, tx1, [trader], {
    commitment: "confirmed",
  });
  console.log({ txHash1 });

  // specify amount of token A and B to deposit:
  // const depositIx = await kamino.deposit(
  //   matchedStrategy,
  //   new Decimal(0),
  //   new Decimal(0.1),
  //   trader.publicKey
  // );
  // tx2.add(depositIx);

  // const depositIx = await kamino.singleSidedDepositTokenA(
  //   matchedStrategy,
  //   new Decimal(0.01),
  //   trader.publicKey,
  //   new Decimal(50)
  // );
  const depositIx = await kamino.singleSidedDepositTokenB(
    matchedStrategy,
    new Decimal(0.1),
    trader.publicKey,
    new Decimal(50)
  );
  let tx2 = createTransactionWithExtraBudget(1200000);
  tx2.add(...depositIx.instructions);

  tx2 = await assignBlockInfoToTransaction(connection, tx2, trader.publicKey);
  const txHash2 = await sendAndConfirmTransaction(connection, tx2, [trader], {
    commitment: "confirmed",
  });
  console.log({ txHash2 });
  return txHash2;

  const lookupTableRequests: AddressLookupTableAccount[] =
    depositIx.lookupTablesAddresses.map((address) => {
      return (async () => {
        const lookupTableAccount = (
          await connection.getAddressLookupTable(address)
        ).value;
        return lookupTableAccount;
      })();
    });

  const lookupTableAccounts = await Promise.all(lookupTableRequests);

  const latestBlockHash = await connection.getLatestBlockhash();

  const depositInstructions = [...depositIx.instructions];

  // construct a v0 compatible transaction `Message`
  const messageV0 = new TransactionMessage({
    payerKey: trader.publicKey,
    recentBlockhash: latestBlockHash.blockhash,
    instructions: [...ataInstructions, ...depositInstructions], // note this is an array of instructions
  }).compileToV0Message(lookupTableAccounts);

  // create a v0 transaction from the v0 message
  const transactionV0 = new VersionedTransaction(messageV0);

  // sign the v0 transaction using the file system wallet we created named `payer`
  transactionV0.sign([trader]);
  // send and confirm the transaction
  // (NOTE: There is NOT an array of Signers here; see the note below...)
  const txid = await connection.sendTransaction(transactionV0);

  console.log(`Transaction: https://explorer.solana.com/tx/${txid}`);

  return txid;
}
