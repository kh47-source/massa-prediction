import { Args, bytesToU256, Result, Serializable } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';

/**
 * Round struct to store round information
 */
export class Round implements Serializable {
  constructor(
    public epoch: u256 = u256.Zero,
    public startTimestamp: u64 = 0,
    public lockTimestamp: u64 = 0,
    public closeTimestamp: u64 = 0,
    public lockPrice: u256 = u256.Zero,
    public closePrice: u256 = u256.Zero,
    public totalAmount: u256 = u256.Zero,
    public bullAmount: u256 = u256.Zero,
    public bearAmount: u256 = u256.Zero,
    public rewardBaseCalAmount: u256 = u256.Zero,
    public rewardAmount: u256 = u256.Zero,
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

    this.epoch = args.nextU256().expect('Invalid epoch');
    this.startTimestamp = args.nextU64().expect('Invalid start timestamp');
    this.lockTimestamp = args.nextU64().expect('Invalid lock timestamp');
    this.closeTimestamp = args.nextU64().expect('Invalid close timestamp');
    this.lockPrice = args.nextU256().expect('Invalid lock price');
    this.closePrice = args.nextU256().expect('Invalid close price');
    this.totalAmount = args.nextU256().expect('Invalid total amount');
    this.bullAmount = args.nextU256().expect('Invalid bull amount');
    this.bearAmount = args.nextU256().expect('Invalid bear amount');
    this.rewardBaseCalAmount = args
      .nextU256()
      .expect('Invalid reward base cal amount');
    this.rewardAmount = args.nextU256().expect('Invalid reward amount');

    return new Result(args.offset);
  }
}
