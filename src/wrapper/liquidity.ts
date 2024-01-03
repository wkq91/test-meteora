// There are three levels of data you can request (and cache) about the lending market.

import { mainnetRpcUrl, trader } from "@/config";
import { getAssociatedTokenAddress } from "@hubbleprotocol/kamino-lending-sdk";
import {
  Kamino,
  assignBlockInfoToTransaction,
  collToLamportsDecimal,
  createTransactionWithExtraBudget,
  getAssociatedTokenAddressAndData,
  isSOLMint,
  sendTransactionWithLogs,
} from "@hubbleprotocol/kamino-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token03";
import {
  Connection,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
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

export async function depositToStrategy(amount: number = 0.01) {
  console.log("1111");

  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  // SOL-USDC Raydium
  // const stragegyAddress = "CEz5keL9hBCUbtVbmcwenthRMwmZLupxJ6YtYAgzp4ex";
  // https://app.kamino.finance/liquidity/7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5
  const stragegyAddress = "7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5";

  const strategyState = await kamino.getStrategyByAddress(
    new PublicKey(stragegyAddress)
  );

  if (!strategyState) {
    console.error("strategy is null");
    return;
  }

  console.log("tokenAMint", strategyState.tokenAMint.toString());
  console.log("tokenBMint", strategyState.tokenBMint.toString());
  console.log(
    "tokenAMintDecimals",
    strategyState.tokenAMintDecimals.toString()
  );
  console.log(
    "tokenBMintDecimals",
    strategyState.tokenBMintDecimals.toString()
  );

  let amounts = await kamino.calculateAmountsToBeDeposited(
    new PublicKey(stragegyAddress),
    new Decimal(0.01)
  );

  console.log("amounts 0", amounts[0].toString());
  console.log("amounts 1", amounts[1].toString());

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
  } else {
    console.log("ataInstructions empty");
  }

  const associatedTokenAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    trader.publicKey
  );
  const closeAccountIx = createCloseAccountInstruction(
    associatedTokenAccount,
    trader.publicKey,
    trader.publicKey,
    [],
    TOKEN_PROGRAM_ID
  );

  // Add wSOL if mint SOL
  if (
    isSOLMint(strategyState.tokenAMint) ||
    isSOLMint(strategyState.tokenBMint)
  ) {
    let wSOLAmount = isSOLMint(strategyState.tokenAMint)
      ? collToLamportsDecimal(
          amounts[0],
          strategyState.tokenAMintDecimals.toNumber()
        )
      : collToLamportsDecimal(
          amounts[1],
          strategyState.tokenBMintDecimals.toNumber()
        );

    tx.add(
      // trasnfer SOL
      SystemProgram.transfer({
        fromPubkey: trader.publicKey,
        toPubkey: associatedTokenAccount,
        lamports: BigInt(wSOLAmount.floor().toString()),
      }),
      createSyncNativeInstruction(associatedTokenAccount)
    );
  }

  // Create Accounts, add wSOL balances
  let createAtasRes = await sendTransactionWithLogs(
    connection,
    tx,
    trader.publicKey,
    [trader]
  );
  console.log(`createAtas Transaction: https://solana.fm/tx/${createAtasRes}`);

  let depositIx = await kamino.deposit(
    new PublicKey(stragegyAddress),
    amounts[0],
    new Decimal(Number(amounts[1]) * 1),
    trader.publicKey
  );

  let depositTx = createTransactionWithExtraBudget(1200000);
  depositTx.add(depositIx);
  // close wSOL account
  depositTx.add(closeAccountIx);

  depositTx = await assignBlockInfoToTransaction(
    connection,
    depositTx,
    trader.publicKey
  );

  const txHash = await sendAndConfirmTransaction(
    connection,
    depositTx,
    [trader],
    {
      commitment: "processed",
      skipPreflight: true,
    }
  );

  console.log(`deposit Transaction: https://solana.fm/tx/${txHash}`);

  return txHash;
}

export async function withdrawLiquidityShares() {
  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  // https://app.kamino.finance/liquidity/7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5
  const stragegyAddress = "7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5";

  const strategyState = await kamino.getStrategyByAddress(
    new PublicKey(stragegyAddress)
  );

  if (!strategyState) {
    console.error("strategy not found");
    return;
  }

  // check if associated token addresses exist for token A, B and shares
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

  // add creation of associated token addresses to the transaction instructions if they don't exist
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

  // const withdrawIx = await kamino.withdrawShares(
  //   strategyWithAddres,
  //   new Decimal(0.2),
  //   trader.publicKey
  // );
  const withdrawIx = await kamino.withdrawAllShares(
    strategyWithAddres,
    trader.publicKey
  );

  if (!withdrawIx) {
    console.error("withdrawIx empty");
    return;
  }

  let withdrawTx = createTransactionWithExtraBudget(1200000);
  if (ataInstructions.length > 0) {
    withdrawTx.add(...ataInstructions);
  }
  if (withdrawIx.prerequisiteIxs.length > 0) {
    withdrawTx.add(...withdrawIx.prerequisiteIxs);
  }
  withdrawTx.add(withdrawIx.withdrawIx);

  withdrawTx = await assignBlockInfoToTransaction(
    connection,
    withdrawTx,
    trader.publicKey
  );

  const txHash = await sendAndConfirmTransaction(
    connection,
    withdrawTx,
    [trader],
    {
      commitment: "processed",
      skipPreflight: true,
    }
  );
  console.log(`withdraw Transaction: https://solana.fm/tx/${txHash}`);

  return txHash;
}
