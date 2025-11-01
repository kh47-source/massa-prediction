import {
  Args,
  type DeserializedResult,
  type Serializable,
} from "@massalabs/massa-web3";

export enum Position {
  Bear = 0,
  Bull = 1,
}

export class Round implements Serializable<Round> {
  constructor(
    public epoch: bigint = 0n,
    public startTimestamp: bigint = 0n,
    public lockTimestamp: bigint = 0n,
    public closeTimestamp: bigint = 0n,
    public lockPrice: bigint = 0n,
    public closePrice: bigint = 0n,
    public totalAmount: bigint = 0n,
    public bullAmount: bigint = 0n,
    public bearAmount: bigint = 0n,
    public rewardBaseCalAmount: bigint = 0n,
    public rewardAmount: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU256(this.epoch)
      .addU64(this.startTimestamp)
      .addU64(this.lockTimestamp)
      .addU64(this.closeTimestamp)
      .addU256(this.lockPrice)
      .addU256(this.closePrice)
      .addU256(this.totalAmount)
      .addU256(this.bullAmount)
      .addU256(this.bearAmount)
      .addU256(this.rewardBaseCalAmount)
      .addU256(this.rewardAmount)
      .serialize();

    return args;
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Round> {
    const args = new Args(data, offset);

    this.epoch = args.nextU256();
    this.startTimestamp = args.nextU64();
    this.lockTimestamp = args.nextU64();
    this.closeTimestamp = args.nextU64();
    this.lockPrice = args.nextU256();
    this.closePrice = args.nextU256();
    this.totalAmount = args.nextU256();
    this.bullAmount = args.nextU256();
    this.bearAmount = args.nextU256();
    this.rewardBaseCalAmount = args.nextU256();
    this.rewardAmount = args.nextU256();

    return { instance: this, offset: args.getOffset() };
  }
}

export class BetInfo implements Serializable<BetInfo> {
  constructor(
    public position: Position = Position.Bull,
    public amount: bigint = 0n,
    public claimed: boolean = false
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU8(BigInt(this.position))
      .addU256(this.amount)
      .addBool(this.claimed)
      .serialize();

    return args;
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<BetInfo> {
    const args = new Args(data, offset);

    this.position = Number(args.nextU8()) as Position;
    this.amount = args.nextU256();
    this.claimed = args.nextBool();

    return { instance: this, offset: args.getOffset() };
  }
}
