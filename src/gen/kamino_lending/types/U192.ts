import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface U192Fields {
  value: Array<BN>
  padding: Array<BN>
}

export interface U192JSON {
  value: Array<string>
  padding: Array<string>
}

export class U192 {
  readonly value: Array<BN>
  readonly padding: Array<BN>

  constructor(fields: U192Fields) {
    this.value = fields.value
    this.padding = fields.padding
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.array(borsh.u64(), 3, "value"),
        borsh.array(borsh.u64(), 3, "padding"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new U192({
      value: obj.value,
      padding: obj.padding,
    })
  }

  static toEncodable(fields: U192Fields) {
    return {
      value: fields.value,
      padding: fields.padding,
    }
  }

  toJSON(): U192JSON {
    return {
      value: this.value.map((item) => item.toString()),
      padding: this.padding.map((item) => item.toString()),
    }
  }

  static fromJSON(obj: U192JSON): U192 {
    return new U192({
      value: obj.value.map((item) => new BN(item)),
      padding: obj.padding.map((item) => new BN(item)),
    })
  }

  toEncodable() {
    return U192.toEncodable(this)
  }
}
