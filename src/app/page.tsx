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
  queryLiquidityPools,
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
            Supply SOL
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
            Withdraw SOL
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
              Borrow USDC
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
              Repay USDC
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
              Borrow bSOL
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
              Repay bSOL
            </button>
          </div>

          <div className="mt-5 text-blue-500">Liquidity</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await depositLiquidityShares();
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Deposit in JitoSOL-SOL
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              const hash = await withdrawLiquidityShares();
              if (hash) {
                setTxids([hash, ...txids]);
              }
            }}
          >
            Withdraw from JitoSOL-SOL
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
