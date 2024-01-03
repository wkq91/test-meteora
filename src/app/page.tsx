"use client";
import {
  queryUserObligation,
  sendBorrow,
  sendRepay,
  sendSupply,
  sendWithdraw,
} from "@/wrapper/lending";
import {
  depositLiquidityShares,
  depositToStrategy,
  queryLiquidityPools,
  singleSidedDepositToStrategy,
  withdrawLiquidityShares,
} from "@/wrapper/liquidity";
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
          <div className="text-blue-500">Query</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              queryUserObligation();
              queryLiquidityPools();
            }}
          >
            Query User Data
          </button>

          <div className="mt-5 text-blue-500">Borrow/Lend</div>
          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await sendSupply("SOL");
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Supply 0.01 SOL
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await sendWithdraw("SOL");
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Withdraw 0.01 SOL
          </button>

          <div className="flex">
            <button
              className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
              onClick={async () => {
                const hash = await sendBorrow("USDC", 0.1);
                if (hash) {
                  setTxids([hash, ...txids]);
                }
              }}
            >
              Borrow 0.1 USDC
            </button>

            <button
              className="ml-5 mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
              onClick={async () => {
                const hash = await sendRepay("USDC", 0.1);
                if (hash) {
                  setTxids([hash, ...txids]);
                }
              }}
            >
              Repay 0.1 USDC
            </button>
          </div>

          <div className="flex">
            <button
              className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
              onClick={async () => {
                const hash = await sendBorrow("bSOL", 0.001);
                if (hash) {
                  setTxids([hash, ...txids]);
                }
              }}
            >
              Borrow 0.001 bSOL
            </button>

            <button
              className="ml-5 mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
              onClick={async () => {
                const hash = await sendRepay("bSOL", 0.001);
                if (hash) {
                  setTxids([hash, ...txids]);
                }
              }}
            >
              Repay 0.001 bSOL
            </button>
          </div>

          <div className="mt-5 text-blue-500">Liquidity</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              // const hash = await depositLiquidityShares();
              // if (hash) {
              //   setTxids([hash, ...txids]);
              // }
              depositToStrategy();
              // singleSidedDepositToStrategy();
            }}
          >
            Deposit in Orca bSOL-SOL
          </button>

          <div className="break-all mt-1">
            Deposit 0.01 SOL and about 0.0098 bSOL into{" "}
            <a
              href="https://app.kamino.finance/liquidity/7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5"
              target="_blank"
              className="text-red-500 underline"
            >
              https://app.kamino.finance/liquidity/7ypH9hpQ6fLRXCVdK9Zb6zSgUvzFp44EN7PWfWdUBDb5
            </a>
          </div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await withdrawLiquidityShares();
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Withdraw all shares from Orca bSOL-SOL
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
