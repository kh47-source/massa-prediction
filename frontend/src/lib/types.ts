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
      .addU64(this.epoch)
      .addU64(this.startTimestamp)
      .addU64(this.lockTimestamp)
      .addU64(this.closeTimestamp)
      .addU64(this.lockPrice)
      .addU64(this.closePrice)
      .addU64(this.totalAmount)
      .addU64(this.bullAmount)
      .addU64(this.bearAmount)
      .addU64(this.rewardBaseCalAmount)
      .addU64(this.rewardAmount)
      .serialize();

    return args;
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Round> {
    const args = new Args(data, offset);

    this.epoch = args.nextU64();
    this.startTimestamp = args.nextU64();
    this.lockTimestamp = args.nextU64();
    this.closeTimestamp = args.nextU64();
    this.lockPrice = args.nextU64();
    this.closePrice = args.nextU64();
    this.totalAmount = args.nextU64();
    this.bullAmount = args.nextU64();
    this.bearAmount = args.nextU64();
    this.rewardBaseCalAmount = args.nextU64();
    this.rewardAmount = args.nextU64();

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
      .addU64(this.amount)
      .addBool(this.claimed)
      .serialize();

    return args;
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<BetInfo> {
    const args = new Args(data, offset);

    this.position = Number(args.nextU8()) as Position;
    this.amount = args.nextU64();
    this.claimed = args.nextBool();

    return { instance: this, offset: args.getOffset() };
  }
}
