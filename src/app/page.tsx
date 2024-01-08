"use client";
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
          <div className="text-blue-500">Query</div>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {}}
          >
            Query User Data
          </button>

          <div className="mt-5 text-blue-500">Vault</div>
          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              depositToVault(
                "SOL",
                0.01,
                "7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF"
              );
            }}
          >
            Deposit 0.01 SOL
          </button>

          <button
            className="mt-5 p-2 border-solid border-gray-50 border-[1px] rounded-sm"
            onClick={async () => {
              withdrawFromVault(
                "SOL"
                // "7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF"
              );
            }}
          >
            Withdraw all SOL
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
