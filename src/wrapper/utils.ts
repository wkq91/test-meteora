export function getChainAmount(amount: number, symbol: string) {
  let decimals = 1000000000;
  if (symbol === "USDC") {
    decimals = 1000000;
  }
  return amount * decimals;
}
