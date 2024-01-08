import { Keypair, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";

export const networkEnv = "mainnet-beta";
// export const env = 'devnet';

export const rpcUrl =
  networkEnv === "mainnet-beta"
    ? "https://solana-mainnet.g.alchemy.com/v2/-YCCuGaEKqUguNcRLwp9D1oxhS-usK-X"
    : clusterApiUrl("devnet");

export const trader = Keypair.fromSecretKey(
  base58.decode(process.env.NEXT_PUBLIC_USER_KEY || "")
);
