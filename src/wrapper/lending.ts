// There are three levels of data you can request (and cache) about the lending market.

import { mainnetRpcUrl, trader } from "@/config";
import { LendingMarket } from "@/gen/kamino_lending/accounts";
import {
  KaminoAction,
  KaminoMarket,
  PROGRAM_ID,
  VanillaObligation,
  sendTransactionV0,
} from "@hubbleprotocol/kamino-lending-sdk";
import { Kamino } from "@hubbleprotocol/kamino-sdk";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import { getChainAmount } from "./utils";

export async function queryUserObligation() {
  const connection = new Connection(mainnetRpcUrl);

  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  // 2. Refresh on-chain accounts for reserve data and cache
  await market.loadReserves();

  // Refresh all cached data
  //   market.refreshAll();

  const obligation = await market.getObligationByWallet(
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );
  console.log({ obligation });

  if (!obligation) {
    return;
  }

  console.log(
    "allowedBorrowValueSf:",
    obligation?.state?.allowedBorrowValueSf?.toString()
  );

  const deposits = obligation?.deposits;
  deposits?.forEach((deposit) => {
    const amount = deposit.amount;
    console.log("deposit amount:", amount.toString());
  });

  const borrows = obligation?.borrows;
  borrows?.forEach((borrow) => {
    console.log("borrow amount:", borrow.amount.toString());
    console.log("borrow mint:", borrow.mintAddress.toString());
  });

  return obligation;
}

export async function testKaminoSdk() {
  const connection = new Connection(mainnetRpcUrl);
  const kamino = new Kamino("mainnet-beta", connection);

  // get all strategies supported by Kamino
  const strategies = await kamino.getStrategies();
  console.log({ strategies });
}

export async function sendSupply(symbol: string) {
  const connection = new Connection(mainnetRpcUrl);
  // 1. Initalize market with parameters and metadata
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  await market.loadReserves();

  const reserveMint = market.getReserveMintBySymbol(symbol);
  console.log("reserveMint:", reserveMint?.toString());

  if (!reserveMint) {
    console.error("Can not find symbol mint");
    return;
  }

  const action = await KaminoAction.buildDepositTxns(
    market,
    getChainAmount(0.01, symbol) + "",
    reserveMint,
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );

  const hash = await action.sendTransactions(
    async (transaction, connection) => {
      const txId = await sendAndConfirmTransaction(
        connection,
        transaction,
        [trader],
        {
          commitment: "confirmed",
        }
      );
      console.log({ txId });
      return txId;
    }
  );

  return hash;
}

export async function sendWithdraw(symbol: string) {
  const connection = new Connection(mainnetRpcUrl);
  // 1. Initalize market with parameters and metadata
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  await market.loadReserves();

  const reserveMint = market.getReserveMintBySymbol(symbol);
  console.log("reserveMint:", reserveMint?.toString());

  if (!reserveMint) {
    console.error("Can not find symbol mint");
    return;
  }

  const action = await KaminoAction.buildWithdrawTxns(
    market,
    getChainAmount(0.01, symbol) + "",
    reserveMint,
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );

  const hash = await action.sendTransactions(
    async (transaction, connection) => {
      const txId = await sendAndConfirmTransaction(
        connection,
        transaction,
        [trader],
        {
          commitment: "confirmed",
        }
      );
      console.log({ txId });
      return txId;
    }
  );

  return hash;
}

export async function sendBorrow(symbol: string, amount = 0.1) {
  const connection = new Connection(mainnetRpcUrl);
  // 1. Initalize market with parameters and metadata
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  await market.loadReserves();

  const reserveMint = market.getReserveMintBySymbol(symbol);
  console.log("reserveMint:", reserveMint?.toString());

  if (!reserveMint) {
    console.error("Can not find symbol mint");
    return;
  }

  const action = await KaminoAction.buildBorrowTxns(
    market,
    getChainAmount(amount, symbol) + "",
    reserveMint,
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );

  const hash = await action.sendTransactions(
    async (transaction, connection) => {
      const txId = await sendAndConfirmTransaction(
        connection,
        transaction,
        [trader],
        {
          commitment: "confirmed",
        }
      );
      console.log({ txId });
      return txId;
    }
  );

  return hash;
}

export async function sendRepay(symbol: string, amount = 0.1) {
  const connection = new Connection(mainnetRpcUrl);
  // 1. Initalize market with parameters and metadata
  const market = await KaminoMarket.load(
    connection,
    new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // main market address. Defaults to 'Main' market
  );

  if (!market) {
    return;
  }

  await market.loadReserves();

  const reserveMint = market.getReserveMintBySymbol(symbol);
  console.log("reserveMint:", reserveMint?.toString());

  if (!reserveMint) {
    console.error("Can not find symbol mint");
    return;
  }

  const action = await KaminoAction.buildRepayTxns(
    market,
    getChainAmount(amount, symbol) + "",
    reserveMint,
    trader.publicKey,
    new VanillaObligation(PROGRAM_ID)
  );

  const hash = await action.sendTransactions(
    async (transaction, connection) => {
      const txId = await sendAndConfirmTransaction(
        connection,
        transaction,
        [trader],
        {
          commitment: "confirmed",
        }
      );
      console.log({ txId });
      return txId;
    }
  );

  return hash;
}
