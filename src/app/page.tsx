"use client";
import {
  claimFromFarmPool,
  stakeInFarmPool,
  unstakeFromFarmPool,
} from "@/wrapper/farm";
import {
  balanceDepositToPool,
  balanceWithdrawFromPool,
  imbalanceDepositToStablePool,
  imbalanceWithdrawFromPool,
  swapTokenInPool,
} from "@/wrapper/pools";
import { depositToVault, withdrawFromVault } from "@/wrapper/vault";
import { useEffect, useState } from "react";

export default function Home() {
  const [txids, setTxids] = useState<string[]>([]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        className="z-10 max-w-5xl w-full items-start justify-between font-mono text-sm grid"
        style={{
          gridTemplateColumns: "65% 35%",
        }}
      >
        <div className="flex flex-col items-start">
          <div className="mt-5 text-blue-500">Vault</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await depositToVault(
                "SOL",
                0.01
                // "7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF"
              );

              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Deposit 0.01 SOL
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await withdrawFromVault(
                "SOL"
                // "7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Withdraw all SOL
          </button>

          <div className="mt-5 text-blue-500">Pools</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await balanceDepositToPool(
                "5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs",
                "USDC",
                "SOL"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Balance Deposit to USDC-SOL Constant Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await imbalanceDepositToStablePool(
                "VeUxoUzPpMPCpvZBP9ysjSPtrTqPo7AJvG6AH2UdXCG",
                "USDT",
                0,
                "USDC",
                0.01
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Imbalance Deposit to USDT-USDC Stable Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await balanceWithdrawFromPool(
                "5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs",
                "USDC",
                "SOL"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Balance Withdraw all from USDC-SOL Constant Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await imbalanceWithdrawFromPool(
                "VeUxoUzPpMPCpvZBP9ysjSPtrTqPo7AJvG6AH2UdXCG",
                "USDT",
                "USDC"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Imbalance Withdraw all from USDT-USDC Stable Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await swapTokenInPool(
                "7kaBqPoHUT1BgN7igwfBJEtBLiKNMa8S85KH45D4ccAH",
                "USDT",
                "SOL"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Swap SOL to USDT in USDT-SOL Pool
          </button>

          <div className="mt-5 text-blue-500">Farm</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await imbalanceDepositToStablePool(
                "DvWpLaNUPqoCGn4foM6hekAPKqMtADJJbJWhwuMiT6vK",
                "SOL",
                0.01,
                "bSOL",
                0
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Deposit 0.01 SOL to SOL-bSOL Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await stakeInFarmPool(
                "DvWpLaNUPqoCGn4foM6hekAPKqMtADJJbJWhwuMiT6vK",
                "SOL",
                "bSOL"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Stake LP in SOL-bSOL Farm Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await unstakeFromFarmPool(
                "DvWpLaNUPqoCGn4foM6hekAPKqMtADJJbJWhwuMiT6vK"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Unstake LP from SOL-bSOL Farm Pool
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await claimFromFarmPool(
                "DvWpLaNUPqoCGn4foM6hekAPKqMtADJJbJWhwuMiT6vK"
              );
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Claim Reward from SOL-bSOL Farm Pool
          </button>
        </div>

        <div className="mr-5 break-all">
          <div>Tx ids:</div>
          {txids.map((txid) => (
            <a
              key={txid}
              href={`https://explorer.solana.com/tx/${txid}`}
              target="_blank"
              className="mt-5 text-red-500 underline block"
            >
              {txid}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
