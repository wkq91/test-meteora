import { networkEnv, rpcUrl, trader } from "@/config";
import { VaultInfo } from "@/types";
import VaultImpl, { KEEPER_URL } from "@mercurial-finance/vault-sdk";
import {
  StaticTokenListResolutionStrategy,
  TokenInfo,
} from "@solana/spl-token-registry";
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { toLamports } from "./utils";
import { BN } from "bn.js";
import AmmImpl, { MAINNET_POOL } from "@mercurial-finance/dynamic-amm-sdk";

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const URL = KEEPER_URL[networkEnv];

export async function balanceDepositToPool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenSymbolB: string
) {
  console.log("Start deposit");

  const connection = new Connection(rpcUrl);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);

  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const inAmountALamport = new BN(toLamports(1, tokenA.decimals));

  // Get deposit quote for constant product
  const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } =
    pool.getDepositQuote(inAmountALamport, new BN(0), true, 2);

  console.log("A in", tokenAInAmount.toString());
  console.log("B in", tokenBInAmount.toString());
  console.log("out", poolTokenAmountOut.toString());

  const depositTx = await pool.deposit(
    trader.publicKey,
    tokenAInAmount,
    tokenBInAmount,
    poolTokenAmountOut
  ); // Web3 Transaction Object

  let { blockhash } = await connection.getLatestBlockhash();
  depositTx.recentBlockhash = blockhash;
  depositTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(
    connection,
    depositTx,
    [trader],
    {
      commitment: "confirmed",
    }
  );
  console.log(`deposit Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function imbalanceDepositToStablePool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenAAmount: number,
  tokenSymbolB: string,
  tokenBAmount: number
) {
  console.log("Start deposit");

  const connection = new Connection(rpcUrl);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);

  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const inAmountALamport = new BN(toLamports(tokenAAmount, tokenA.decimals));
  const inAmountBLamport = new BN(toLamports(tokenBAmount, tokenB.decimals));

  // Get deposit quote for constant product
  const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } =
    pool.getDepositQuote(inAmountALamport, inAmountBLamport, false, 2);

  console.log("A in", tokenAInAmount.toString());
  console.log("B in", tokenBInAmount.toString());
  console.log("out", poolTokenAmountOut.toString());

  const depositTx = await pool.deposit(
    trader.publicKey,
    tokenAInAmount,
    tokenBInAmount,
    poolTokenAmountOut
  ); // Web3 Transaction Object

  let { blockhash } = await connection.getLatestBlockhash();
  depositTx.recentBlockhash = blockhash;
  depositTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(
    connection,
    depositTx,
    [trader],
    {
      commitment: "confirmed",
    }
  );
  console.log(`deposit Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function balanceWithdrawFromPool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenSymbolB: string
) {
  console.log("Start withdraw");

  const connection = new Connection(rpcUrl);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);

  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const userLpBalance = await pool.getUserBalance(trader.publicKey);

  const outTokenAmountLamport = new BN(userLpBalance);

  const { poolTokenAmountIn, tokenAOutAmount, tokenBOutAmount } =
    pool.getWithdrawQuote(outTokenAmountLamport, 2); // use lp balance for full withdrawal

  const withdrawTx = await pool.withdraw(
    trader.publicKey,
    poolTokenAmountIn,
    tokenAOutAmount,
    tokenBOutAmount
  );

  console.log("in", poolTokenAmountIn.toString());
  console.log("A out", tokenAOutAmount.toString());
  console.log("B out", tokenBOutAmount.toString());

  let { blockhash } = await connection.getLatestBlockhash();
  withdrawTx.recentBlockhash = blockhash;
  withdrawTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(
    connection,
    withdrawTx,
    [trader],
    {
      commitment: "confirmed",
    }
  );
  console.log(`withdraw Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function imbalanceWithdrawFromPool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenSymbolB: string
) {
  console.log("Start withdraw");
  const connection = new Connection(rpcUrl);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);

  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const userLpBalance = await pool.getUserBalance(trader.publicKey);

  const outTokenAmountLamport = new BN(userLpBalance);

  const { poolTokenAmountIn, tokenAOutAmount, tokenBOutAmount } =
    pool.getWithdrawQuote(
      outTokenAmountLamport,
      2,
      new PublicKey(pool.tokenA.address)
    );

  console.log("in", poolTokenAmountIn.toString());
  console.log("A out", tokenAOutAmount.toString());
  console.log("B out", tokenBOutAmount.toString());

  const withdrawTx = await pool.withdraw(
    trader.publicKey,
    poolTokenAmountIn,
    tokenAOutAmount,
    tokenBOutAmount
  );

  let { blockhash } = await connection.getLatestBlockhash();
  withdrawTx.recentBlockhash = blockhash;
  withdrawTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(
    connection,
    withdrawTx,
    [trader],
    {
      commitment: "confirmed",
    }
  );
  console.log(`withdraw Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function swapTokenInPool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenSymbolB: string
) {
  console.log("Start swap");
  const connection = new Connection(rpcUrl);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);

  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const inAmountLamport = new BN(0.01 * 10 ** pool.tokenB.decimals);

  // Swap B → A
  const { swapInAmount, swapOutAmount, minSwapOutAmount } = pool.getSwapQuote(
    new PublicKey(pool.tokenB.address),
    inAmountLamport,
    2
  );

  console.log("swapInAmount", swapInAmount.toString());
  console.log("swapOutAmount", swapOutAmount.toString());
  console.log("minSwapOutAmount", minSwapOutAmount.toString());

  const swapTx = await pool.swap(
    trader.publicKey,
    new PublicKey(pool.tokenB.address),
    swapInAmount,
    swapOutAmount
  );

  let { blockhash } = await connection.getLatestBlockhash();
  swapTx.recentBlockhash = blockhash;
  swapTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(connection, swapTx, [trader], {
    commitment: "confirmed",
  });
  console.log(`swap Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}
