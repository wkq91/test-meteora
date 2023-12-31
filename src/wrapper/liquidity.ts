// There are three levels of data you can request (and cache) about the lending market.

import { mainnetRpcUrl, trader } from "@/config";
import {
  KaminoAction,
  KaminoMarket,
  PROGRAM_ID,
  VanillaObligation,
} from "@hubbleprotocol/kamino-lending-sdk";
import {
  Kamino,
  StrategyWithAddress,
  assignBlockInfoToTransaction,
  createTransactionWithExtraBudget,
  getAssociatedTokenAddressAndData,
} from "@hubbleprotocol/kamino-sdk";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getChainAmount } from "./utils";
import Decimal from "decimal.js";

export async function queryLiquidityPools() {
  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  // get all strategies supported by Kamino
  // const allStrategies = await kamino.getStrategies();

  // console.log({ allStrategies });

  // Get all unique Orca/Raydium pools from Kamino strategies and return their TVL:
  const whirlpoolsRes = await fetch(
    "https://api.hubbleprotocol.io/whirlpools/tvl",
    {
      method: "GET",
    }
  );
  const whirlpools = await whirlpoolsRes.json();
  whirlpools.sort((item1: any, item2: any) => {
    return Number(item2.tvl) - Number(item1.tvl);
  });
  console.log({ whirlpools });

  const JITOSOL_SOL_POOL_ADDRESS =
    "Hp53XEtt4S8SvPCXarsLSdGfZBuUr5mMmZmX2DRNXQKp";

  const pool = await kamino.getWhirlpoolByAddress(
    new PublicKey(JITOSOL_SOL_POOL_ADDRESS)
  );
  console.log({ pool });
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

  const orcaFirstPool = orcaPools.length > 0 ? orcaPools[0] : null;
  const raydiumFirstPool = raydiumPools.length > 0 ? raydiumPools[0] : null;

  let finalPoolAddress =
    Number(orcaFirstPool?.tvl) > Number(raydiumFirstPool?.tvl)
      ? orcaFirstPool?.address
      : raydiumFirstPool?.id;
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
  // let tx1 = createTransactionWithExtraBudget();
  // if (ataInstructions.length > 0) {
  //   tx1.add(...ataInstructions);
  // }

  // assign block hash, block height and fee payer to the transaction
  // tx1 = await assignBlockInfoToTransaction(connection, tx1, trader.publicKey);
  // const txHash1 = await sendAndConfirmTransaction(connection, tx1, [trader], {
  //   commitment: "confirmed",
  // });
  // console.log({ txHash1 });

  // specify amount of token A and B to deposit:
  // const depositIx = await kamino.deposit(
  //   matchedStrategy,
  //   new Decimal(0),
  //   new Decimal(0.1),
  //   trader.publicKey
  // );
  // tx2.add(depositIx);

  const depositIx = await kamino.singleSidedDepositTokenA(
    matchedStrategy,
    new Decimal(0.01),
    trader.publicKey,
    new Decimal(50)
  );
  // const depositIx = await kamino.singleSidedDepositTokenB(
  //   matchedStrategy,
  //   new Decimal(0.1),
  //   trader.publicKey,
  //   new Decimal(50)
  // );

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

  const requests1 = depositInstructions.map((i) => {
    return (async () => {
      // construct a v0 compatible transaction `Message`
      const messageV0 = new TransactionMessage({
        payerKey: trader.publicKey,
        recentBlockhash: latestBlockHash.blockhash,
        instructions: [i], // note this is an array of instructions
      }).compileToV0Message(lookupTableAccounts);

      // create a v0 transaction from the v0 message
      const transactionV0 = new VersionedTransaction(messageV0);

      // sign the v0 transaction using the file system wallet we created named `payer`
      transactionV0.sign([trader]);
      // send and confirm the transaction
      // (NOTE: There is NOT an array of Signers here; see the note below...)
      const txid = await connection.sendTransaction(transactionV0);

      console.log(`Transaction: https://explorer.solana.com/tx/${txid}`);
    })();
  });

  await Promise.all(requests1);

  return;
}

export async function withdrawLiquidityShares() {
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

  const orcaFirstPool = orcaPools.length > 0 ? orcaPools[0] : null;
  const raydiumFirstPool = raydiumPools.length > 0 ? raydiumPools[0] : null;

  let finalPoolAddress =
    Number(orcaFirstPool?.tvl) > Number(raydiumFirstPool?.tvl)
      ? orcaFirstPool?.address
      : raydiumFirstPool?.id;
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

  const withdrawIx = await kamino.withdrawShares(
    matchedStrategy,
    new Decimal(0.01),
    trader.publicKey
  );
  // const withdrawIx = await kamino.withdrawAllShares(
  //   matchedStrategy,
  //   trader.publicKey
  // );
  if (!withdrawIx) {
    console.error("withdrawIx empty");
    return;
  }

  const latestBlockHash = await connection.getLatestBlockhash();
  // construct a v0 compatible transaction `Message`
  const messageV0 = new TransactionMessage({
    payerKey: trader.publicKey,
    recentBlockhash: latestBlockHash.blockhash,
    instructions: [
      ...ataInstructions,
      // ...withdrawIx.prerequisiteIxs,
      withdrawIx.withdrawIx,
    ], // note this is an array of instructions
  }).compileToV0Message();

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
