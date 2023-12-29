import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface CollateralInfoFields {
  mint: PublicKey
  lowerHeuristic: BN
  upperHeuristic: BN
  expHeuristic: BN
  maxTwapDivergenceBps: BN
  scopePriceIdTwap: BN
  scopePriceChain: Array<number>
  name: Array<number>
  maxAgePriceSeconds: BN
  maxAgeTwapSeconds: BN
  maxIgnorableAmountAsReward: BN
  padding: Array<BN>
}

export interface CollateralInfoJSON {
  mint: string
  lowerHeuristic: string
  upperHeuristic: string
  expHeuristic: string
  maxTwapDivergenceBps: string
  scopePriceIdTwap: string
  scopePriceChain: Array<number>
  name: Array<number>
  maxAgePriceSeconds: string
  maxAgeTwapSeconds: string
  maxIgnorableAmountAsReward: string
  padding: Array<string>
}

export class CollateralInfo {
  readonly mint: PublicKey
  readonly lowerHeuristic: BN
  readonly upperHeuristic: BN
  readonly expHeuristic: BN
  readonly maxTwapDivergenceBps: BN
  readonly scopePriceIdTwap: BN
  readonly scopePriceChain: Array<number>
  readonly name: Array<number>
  readonly maxAgePriceSeconds: BN
  readonly maxAgeTwapSeconds: BN
  readonly maxIgnorableAmountAsReward: BN
  readonly padding: Array<BN>

  constructor(fields: CollateralInfoFields) {
    this.mint = fields.mint
    this.lowerHeuristic = fields.lowerHeuristic
    this.upperHeuristic = fields.upperHeuristic
    this.expHeuristic = fields.expHeuristic
    this.maxTwapDivergenceBps = fields.maxTwapDivergenceBps
    this.scopePriceIdTwap = fields.scopePriceIdTwap
    this.scopePriceChain = fields.scopePriceChain
    this.name = fields.name
    this.maxAgePriceSeconds = fields.maxAgePriceSeconds
    this.maxAgeTwapSeconds = fields.maxAgeTwapSeconds
    this.maxIgnorableAmountAsReward = fields.maxIgnorableAmountAsReward
    this.padding = fields.padding
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("mint"),
        borsh.u64("lowerHeuristic"),
        borsh.u64("upperHeuristic"),
        borsh.u64("expHeuristic"),
        borsh.u64("maxTwapDivergenceBps"),
        borsh.u64("scopePriceIdTwap"),
        borsh.array(borsh.u16(), 4, "scopePriceChain"),
        borsh.array(borsh.u8(), 32, "name"),
        borsh.u64("maxAgePriceSeconds"),
        borsh.u64("maxAgeTwapSeconds"),
        borsh.u64("maxIgnorableAmountAsReward"),
        borsh.array(borsh.u64(), 10, "padding"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new CollateralInfo({
      mint: obj.mint,
      lowerHeuristic: obj.lowerHeuristic,
      upperHeuristic: obj.upperHeuristic,
      expHeuristic: obj.expHeuristic,
      maxTwapDivergenceBps: obj.maxTwapDivergenceBps,
      scopePriceIdTwap: obj.scopePriceIdTwap,
      scopePriceChain: obj.scopePriceChain,
      name: obj.name,
      maxAgePriceSeconds: obj.maxAgePriceSeconds,
      maxAgeTwapSeconds: obj.maxAgeTwapSeconds,
      maxIgnorableAmountAsReward: obj.maxIgnorableAmountAsReward,
      padding: obj.padding,
    })
  }

  static toEncodable(fields: CollateralInfoFields) {
    return {
      mint: fields.mint,
      lowerHeuristic: fields.lowerHeuristic,
      upperHeuristic: fields.upperHeuristic,
      expHeuristic: fields.expHeuristic,
      maxTwapDivergenceBps: fields.maxTwapDivergenceBps,
      scopePriceIdTwap: fields.scopePriceIdTwap,
      scopePriceChain: fields.scopePriceChain,
      name: fields.name,
      maxAgePriceSeconds: fields.maxAgePriceSeconds,
      maxAgeTwapSeconds: fields.maxAgeTwapSeconds,
      maxIgnorableAmountAsReward: fields.maxIgnorableAmountAsReward,
      padding: fields.padding,
    }
  }

  toJSON(): CollateralInfoJSON {
    return {
      mint: this.mint.toString(),
      lowerHeuristic: this.lowerHeuristic.toString(),
      upperHeuristic: this.upperHeuristic.toString(),
      expHeuristic: this.expHeuristic.toString(),
      maxTwapDivergenceBps: this.maxTwapDivergenceBps.toString(),
      scopePriceIdTwap: this.scopePriceIdTwap.toString(),
      scopePriceChain: this.scopePriceChain,
      name: this.name,
      maxAgePriceSeconds: this.maxAgePriceSeconds.toString(),
      maxAgeTwapSeconds: this.maxAgeTwapSeconds.toString(),
      maxIgnorableAmountAsReward: this.maxIgnorableAmountAsReward.toString(),
      padding: this.padding.map((item) => item.toString()),
    }
  }

  static fromJSON(obj: CollateralInfoJSON): CollateralInfo {
    return new CollateralInfo({
      mint: new PublicKey(obj.mint),
      lowerHeuristic: new BN(obj.lowerHeuristic),
      upperHeuristic: new BN(obj.upperHeuristic),
      expHeuristic: new BN(obj.expHeuristic),
      maxTwapDivergenceBps: new BN(obj.maxTwapDivergenceBps),
      scopePriceIdTwap: new BN(obj.scopePriceIdTwap),
      scopePriceChain: obj.scopePriceChain,
      name: obj.name,
      maxAgePriceSeconds: new BN(obj.maxAgePriceSeconds),
      maxAgeTwapSeconds: new BN(obj.maxAgeTwapSeconds),
      maxIgnorableAmountAsReward: new BN(obj.maxIgnorableAmountAsReward),
      padding: obj.padding.map((item) => new BN(item)),
    })
  }

  toEncodable() {
    return CollateralInfo.toEncodable(this)
  }
}
