import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

export const mainnetRpcUrl =
  "https://solana-mainnet.g.alchemy.com/v2/-YCCuGaEKqUguNcRLwp9D1oxhS-usK-X";
// export const devnetRpcUrl = "https://api.devnet.solana.com";

// const testAccountKey =
//   "4ZcYfPAn4yy1moTzXkMJ638cez5ZsoPU1SRAupTfiVrQtM5phUr3NKvsLWcPwkb1KEGd4FNVAsD7PuHBAWMVaEcy";

export const trader = Keypair.fromSecretKey(
  base58.decode(process.env.NEXT_PUBLIC_USER_KEY || "")
);
