import { Args, Result, Serializable } from '@massalabs/as-types';
import { Position } from '../main';

/**
 * BetInfo struct to store user betting information
 */
export class BetInfo implements Serializable {
  constructor(
    public position: Position = Position.Bull,
    public amount: u64 = 0,
    public claimed: bool = false,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.position as u8)
      .add(this.amount)
      .add(this.claimed)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);

    this.position = args.nextU8().expect('Invalid position') as Position;
    this.amount = args.nextU64().expect('Invalid amount');
    this.claimed = args.nextBool().expect('Invalid claimed');

    return new Result(args.offset);
  }
}
