// There are three levels of data you can request (and cache) about the lending market.

import { rpcUrl } from "@/config";
import { KaminoMarket } from "@hubbleprotocol/kamino-lending-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";

export async function readMarketData() {
  const connection = new Connection(rpcUrl);

  // 1. Initalize market with parameters and metadata
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("ABPeWVeRuvii6HuzTYcp1iH5a3ELfeVEviCtm3GfNnLV") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  console.log(
    market.reserves.map((reserve) => reserve.config.loanToValueRatio)
  );

  // 2. Refresh on-chain accounts for reserve data and cache
  await market.loadReserves();

  const usdcReserve = market.getReserve("USDC");
  console.log(usdcReserve?.stats.totalDepositsWads.toString());

  // Read Kamino Lending liquidity mining stats
  // await market.loadRewards();
  // console.log(reserve.stats.totalSupplyAPY().rewards); // {apy: 0.07, rewardMint: "SLND...

  // Refresh all cached data
  market.refreshAll();

  const obligation = market.fetchObligationByWallet("[WALLET_ID]");
  console.log(obligation.stats.borrowLimit);
}

export async function sendDeposit() {
  const trader = Keypair.fromSecretKey(
    base58.decode(
      "RRj5FcZv9zLno2XB6tfsAd8SHM9t7bZ1ofPc2ijp8zm1dMRW2UpsRapPRvUq7wXtrDJYxbUnaUF2YBmATZQ3RPt"
    )
  );
}
