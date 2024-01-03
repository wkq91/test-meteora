// import {
//   DepositAmountsForSwap,
//   getAssociatedTokenAddress,
// } from "@hubbleprotocol/kamino-sdk";
// import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
// import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import Decimal from "decimal.js";

export const FullBPS = 10_000;
export const ZERO = new Decimal(0);

export function getChainAmount(amount: number, symbol: string) {
  let decimals = 1000000000;
  if (symbol === "USDC") {
    decimals = 1000000;
  }
  return amount * decimals;
}

// export async function getLocalSwapIxs(
//   input: DepositAmountsForSwap,
//   tokenAMint: PublicKey,
//   tokenBMint: PublicKey,
//   user: PublicKey,
//   slippageBps: Decimal,
//   mintAuthority?: PublicKey
// ): Promise<[TransactionInstruction[], PublicKey[]]> {
//   let mintAuth = mintAuthority ? mintAuthority : user;

//   let swapIxs: TransactionInstruction[] = [];
//   if (input.tokenAToSwapAmount.lt(ZERO)) {
//     swapIxs = await getSwapAToBWithSlippageBPSIxs(
//       input,
//       tokenAMint,
//       tokenBMint,
//       slippageBps,
//       user,
//       mintAuth
//     );
//   } else {
//     swapIxs = await getSwapBToAWithSlippageBPSIxs(
//       input,
//       tokenAMint,
//       tokenBMint,
//       slippageBps,
//       user,
//       mintAuth
//     );
//   }

//   return [swapIxs, []];
// }

// async function getSwapAToBWithSlippageBPSIxs(
//   input: DepositAmountsForSwap,
//   tokenAMint: PublicKey,
//   tokenBMint: PublicKey,
//   slippageBps: Decimal,
//   user: PublicKey,
//   mintAuthority: PublicKey
// ): Promise<TransactionInstruction[]> {
//   // multiply the tokens to swap by -1 to get the positive sign because we represent as negative numbers what we have to sell
//   let tokensToBurn = -input.tokenAToSwapAmount.toNumber();

//   let tokenAAta = getAssociatedTokenAddress(tokenAMint, user);
//   let tokenBAta = getAssociatedTokenAddress(tokenBMint, user);

//   let bToRecieve = input.tokenBToSwapAmount
//     .mul(new Decimal(FullBPS).sub(slippageBps))
//     .div(FullBPS);
//   let mintToIx = getMintToIx(
//     mintAuthority,
//     tokenBMint,
//     tokenBAta,
//     bToRecieve.toNumber()
//   );
//   let burnFromIx = getBurnFromIx(user, tokenAMint, tokenAAta, tokensToBurn);

//   return [mintToIx, burnFromIx];
// }

// async function getSwapBToAWithSlippageBPSIxs(
//   input: DepositAmountsForSwap,
//   tokenAMint: PublicKey,
//   tokenBMint: PublicKey,
//   slippage: Decimal,
//   owner: PublicKey,
//   mintAuthority: PublicKey
// ) {
//   // multiply the tokens to swap by -1 to get the positive sign because we represent as negative numbers what we have to sell
//   let tokensToBurn = -input.tokenBToSwapAmount.toNumber();

//   let tokenAAta = getAssociatedTokenAddress(tokenAMint, owner);
//   let tokenBAta = getAssociatedTokenAddress(tokenBMint, owner);

//   let aToRecieve = input.tokenAToSwapAmount
//     .mul(new Decimal(FullBPS).sub(slippage))
//     .div(FullBPS);
//   let mintToIx = getMintToIx(
//     mintAuthority,
//     tokenAMint,
//     tokenAAta,
//     aToRecieve.toNumber()
//   );
//   let burnFromIx = getBurnFromIx(owner, tokenBMint, tokenBAta, tokensToBurn);

//   return [mintToIx, burnFromIx];
// }

// export function getMintToIx(
//   signer: PublicKey,
//   mintPubkey: PublicKey,
//   tokenAccount: PublicKey,
//   amount: number
// ): TransactionInstruction {
//   let ix = Token.createMintToInstruction(
//     TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
//     mintPubkey, // mint
//     tokenAccount, // receiver (sholud be a token account)
//     signer, // mint authority
//     [], // only multisig account will use. leave it empty now.
//     amount // amount. if your decimals is 8, you mint 10^8 for 1 token.
//   );

//   return ix;
// }

// export function getBurnFromIx(
//   signer: PublicKey,
//   mintPubkey: PublicKey,
//   tokenAccount: PublicKey,
//   amount: number
// ): TransactionInstruction {
//   console.log(
//     `burnFrom ${tokenAccount.toString()} mint ${mintPubkey.toString()} amount ${amount}`
//   );
//   let ix = Token.createBurnInstruction(
//     TOKEN_PROGRAM_ID,
//     mintPubkey,
//     tokenAccount,
//     signer,
//     [],
//     amount
//   );

//   return ix;
// }
