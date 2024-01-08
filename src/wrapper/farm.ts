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
import { PoolFarmImpl } from "@mercurial-finance/farming-sdk";

const tokenMap = new StaticTokenListResolutionStrategy().resolve();

export async function stakeInFarmPool(
  poolAddress: string,
  tokenSymbolA: string,
  tokenSymbolB: string
) {
  console.log("Start stake");

  const connection = new Connection(rpcUrl);

  const farmingPools = await PoolFarmImpl.getFarmAddressesByPoolAddress(
    new PublicKey(poolAddress)
  );

  if (farmingPools.length === 0) {
    console.error("farming pool not found");
    return;
  }

  // farmingPools is an array (A pool can have multiple farms)
  const farmingPool = farmingPools[0];
  const farm = await PoolFarmImpl.create(connection, farmingPool.farmAddress);

  const tokenA = tokenMap.find((token) => token.symbol === tokenSymbolA);
  const tokenB = tokenMap.find((token) => token.symbol === tokenSymbolB);
  const pool = await AmmImpl.create(
    connection,
    new PublicKey(poolAddress),
    tokenA,
    tokenB
  );

  const lpBalance = await pool.getUserBalance(trader.publicKey);
  console.log("lpBalance", lpBalance.toString());

  const stakeTx = await farm.deposit(trader.publicKey, lpBalance);

  let { blockhash } = await connection.getLatestBlockhash();
  stakeTx.recentBlockhash = blockhash;
  stakeTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(connection, stakeTx, [trader], {
    commitment: "confirmed",
  });
  console.log(`stake Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function unstakeFromFarmPool(poolAddress: string) {
  console.log("Start unstake");

  const connection = new Connection(rpcUrl);

  const farmingPools = await PoolFarmImpl.getFarmAddressesByPoolAddress(
    new PublicKey(poolAddress)
  );

  if (farmingPools.length === 0) {
    console.error("farming pool not found");
    return;
  }

  // farmingPools is an array (A pool can have multiple farms)
  const farmingPool = farmingPools[0];
  const farm = await PoolFarmImpl.create(connection, farmingPool.farmAddress);

  const farmBalance = await farm.getUserBalance(trader.publicKey);
  console.log("farmBalance", farmBalance.toString());

  const unstakeTx = await farm.withdraw(trader.publicKey, farmBalance);

  let { blockhash } = await connection.getLatestBlockhash();
  unstakeTx.recentBlockhash = blockhash;
  unstakeTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(
    connection,
    unstakeTx,
    [trader],
    {
      commitment: "confirmed",
    }
  );
  console.log(`unstake Transaction: https://solana.fm/tx/${txId}`);

  return txId;
}

export async function claimFromFarmPool(poolAddress: string) {
  console.log("Start claim");

  const connection = new Connection(rpcUrl);

  const farmingPools = await PoolFarmImpl.getFarmAddressesByPoolAddress(
    new PublicKey(poolAddress)
  );

  if (farmingPools.length === 0) {
    console.error("farming pool not found");
    return;
  }

  // farmingPools is an array (A pool can have multiple farms)
  const farmingPool = farmingPools[0];
  const farm = await PoolFarmImpl.create(connection, farmingPool.farmAddress);

  const claimTx = await farm.claim(trader.publicKey);

  let { blockhash } = await connection.getLatestBlockhash();
  claimTx.recentBlockhash = blockhash;
  claimTx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(connection, claimTx, [trader], {
    commitment: "confirmed",
  });

  console.log(`claim Transaction: https://solana.fm/tx/${txId}`);
  return txId;
}
