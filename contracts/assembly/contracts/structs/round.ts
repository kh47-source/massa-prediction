import { Args, Result, Serializable } from '@massalabs/as-types';

/**
 * Round struct to store round information
 */
export class Round implements Serializable {
  constructor(
    public epoch: u64 = 0,
    public startTimestamp: u64 = 0,
    public lockTimestamp: u64 = 0,
    public closeTimestamp: u64 = 0,
    public lockPrice: u64 = 0,
    public closePrice: u64 = 0,
    public totalAmount: u64 = 0,
    public bullAmount: u64 = 0,
    public bearAmount: u64 = 0,
    public rewardBaseCalAmount: u64 = 0,
    public rewardAmount: u64 = 0,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.epoch)
      .add(this.startTimestamp)
      .add(this.lockTimestamp)
      .add(this.closeTimestamp)
      .add(this.lockPrice)
      .add(this.closePrice)
      .add(this.totalAmount)
      .add(this.bullAmount)
      .add(this.bearAmount)
      .add(this.rewardBaseCalAmount)
      .add(this.rewardAmount)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);

    this.epoch = args.nextU64().expect('Invalid epoch');
    this.startTimestamp = args.nextU64().expect('Invalid start timestamp');
    this.lockTimestamp = args.nextU64().expect('Invalid lock timestamp');
    this.closeTimestamp = args.nextU64().expect('Invalid close timestamp');
    this.lockPrice = args.nextU64().expect('Invalid lock price');
    this.closePrice = args.nextU64().expect('Invalid close price');
    this.totalAmount = args.nextU64().expect('Invalid total amount');
    this.bullAmount = args.nextU64().expect('Invalid bull amount');
    this.bearAmount = args.nextU64().expect('Invalid bear amount');
    this.rewardBaseCalAmount = args
      .nextU64()
      .expect('Invalid reward base cal amount');
    this.rewardAmount = args.nextU64().expect('Invalid reward amount');

    return new Result(args.offset);
  }
}
