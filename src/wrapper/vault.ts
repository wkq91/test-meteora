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

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const URL = KEEPER_URL[networkEnv];

export async function depositToVault(
  symbol: string,
  depositAmount: number,
  affiliateId?: string
) {
  const connection = new Connection(rpcUrl);

  const TOKEN_INFO = tokenMap.find(
    (token) => token.symbol === symbol
  ) as TokenInfo;

  const vaultsInfoResponse = await fetch(`${URL}/vault_info`);
  const vaultsInfo = (await vaultsInfoResponse.json()) as VaultInfo[];

  const vaultsToInit = vaultsInfo
    .filter((vault) => vault.token_address === TOKEN_INFO.address)
    .map(async (vault) => {
      const tokenInfo = tokenMap.find(
        (token) => token.address === vault.token_address
      );
      if (!tokenInfo) return null;

      return {
        vaultInfo: vault,
        vaultImpl: await VaultImpl.create(
          connection,
          TOKEN_INFO,
          affiliateId
            ? {
                affiliateId: new PublicKey(affiliateId),
              }
            : {}
        ),
      };
    });

  let availableVaults = await Promise.all(vaultsToInit);
  availableVaults = availableVaults.filter(Boolean);

  console.log({ availableVaults });
  const vault = availableVaults[0];

  if (!vault) {
    console.error("Available Vault not found");
    return;
  }

  const amountInLamports = toLamports(
    Number(depositAmount),
    TOKEN_INFO.decimals
  );
  const tx = await vault.vaultImpl.deposit(
    trader.publicKey,
    new BN(amountInLamports)
  );

  let { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(connection, tx, [trader], {
    commitment: "confirmed",
  });
  console.log(`deposit Transaction: https://solana.fm/tx/${txId}`);
}

export async function withdrawFromVault(symbol: string, affiliateId?: string) {
  const connection = new Connection(rpcUrl);

  const TOKEN_INFO = tokenMap.find(
    (token) => token.symbol === symbol
  ) as TokenInfo;

  const vaultsInfoResponse = await fetch(`${URL}/vault_info`);
  const vaultsInfo = (await vaultsInfoResponse.json()) as VaultInfo[];

  const vaultsToInit = vaultsInfo
    .filter((vault) => vault.token_address === TOKEN_INFO.address)
    .map(async (vault) => {
      const tokenInfo = tokenMap.find(
        (token) => token.address === vault.token_address
      );
      if (!tokenInfo) return null;

      return {
        vaultInfo: vault,
        vaultImpl: await VaultImpl.create(
          connection,
          TOKEN_INFO,
          affiliateId
            ? {
                affiliateId: new PublicKey(affiliateId),
              }
            : {}
        ),
      };
    });

  let availableVaults = await Promise.all(vaultsToInit);
  availableVaults = availableVaults.filter(Boolean);

  console.log({ availableVaults });
  const vault = availableVaults[0];

  if (!vault) {
    console.error("Available Vault not found");
    return;
  }

  const userLpBalance = await vault.vaultImpl.getUserBalance(trader.publicKey);
  const amountInLamports = toLamports(Number(0.01), TOKEN_INFO.decimals);

  console.log("userLpBalance", userLpBalance.toString());

  const tx = await vault.vaultImpl.withdraw(
    trader.publicKey,
    // new BN(amountInLamports)
    new BN(userLpBalance)
  );

  console.log({ tx });

  let { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = trader.publicKey;

  const txId = await sendAndConfirmTransaction(connection, tx, [trader], {
    commitment: "confirmed",
  });
  console.log(`withdraw Transaction: https://solana.fm/tx/${txId}`);
}
