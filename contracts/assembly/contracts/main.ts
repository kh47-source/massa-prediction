/**
 * PredictionMarket contract for Massa blockchain
 * Uses EagleFi DEX for price feeds instead of oracles (due to lack of oracle support on Massa)
 */

import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import {
  Args,
  boolToByte,
  bytesToU256,
  bytesToU32,
  bytesToU64,
  byteToBool,
  stringToBytes,
  u256ToBytes,
  u32ToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import { _setOwner } from './lib/ownership-internal';
import { ReentrancyGuard } from './lib/ReentrancyGuard';
import { u256 } from 'as-bignum/assembly';
import { MAX_TREASURY_FEE } from './lib/constants';
import { onlyOwner } from './lib/ownership';
import { SafeMath256 } from './lib/safeMath';
import { Round } from './structs/round';
import { PersistentMap } from './lib/PersistentMap';

// Storage keys

// Treasury rate (e.g. 200 = 2%, 150 = 1.50%)
const TREASURY_FEE_KEY: StaticArray<u8> = stringToBytes('tf');
const TREASURY_AMOUNT_KEY: StaticArray<u8> = stringToBytes('ta');
const MIN_BET_AMOUNT_KEY: StaticArray<u8> = stringToBytes('mba');
const TOKEN_ADDRESS_KEY = 'ta';
// Current epoch for prediction round
const CURRENT_EPOCH_KEY: StaticArray<u8> = stringToBytes('ce');
// Paused state of the contract
const PAUSED_KEY: StaticArray<u8> = stringToBytes('p');
// Interval in seconds between two prediction rounds
const INTERVALS_SECONDS_KEY: StaticArray<u8> = stringToBytes('in');
// Number of seconds for valid execution of a prediction round
const BUFFER_SECONDS_KEY: StaticArray<u8> = stringToBytes('bs');
// Genesis lock and start flags
const IS_GENESIS_LOCKED_KEY: StaticArray<u8> = stringToBytes('igl');
const IS_GENESIS_STARTED_KEY: StaticArray<u8> = stringToBytes('igs');
// Persistent Map for rounds
const roundsMap = new PersistentMap<u256, Round>('tr');

// Position enum
export enum Position {
  Bear,
  Bull,
}

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(Context.isDeployingContract());

  const args = new Args(binaryArgs);

  const treasuryFee = args.nextU32().expect('TREASURY_FEE_ARG_MISSING');
  const minBetAmount = args.nextU256().expect('MIN_BET_AMOUNT_ARG_MISSING');
  const tokenAddress = args.nextString().expect('TOKEN_ADDRESS_ARG_MISSING');
  const intervalSeconds = args.nextU64().expect('INTERVAL_SECONDS_ARG_MISSING');
  const bufferSeconds = args.nextU64().expect('BUFFER_SECONDS_ARG_MISSING');

  assert(
    treasuryFee <= MAX_TREASURY_FEE,
    'TREASURY_FEE_CANNOT_EXCEED_10_PERCENT',
  );

  Storage.set(TREASURY_FEE_KEY, u32ToBytes(treasuryFee));
  Storage.set(MIN_BET_AMOUNT_KEY, u256ToBytes(minBetAmount));
  Storage.set(TOKEN_ADDRESS_KEY, tokenAddress);
  Storage.set(INTERVALS_SECONDS_KEY, u64ToBytes(intervalSeconds));
  Storage.set(BUFFER_SECONDS_KEY, u64ToBytes(bufferSeconds));

  // Initialize current epoch to 0
  Storage.set(CURRENT_EPOCH_KEY, u256ToBytes(u256.Zero));

  // Initialize treasury amount to 0
  Storage.set(TREASURY_AMOUNT_KEY, u256ToBytes(u256.Zero));

  // Initialize contract as unpaused
  Storage.set(PAUSED_KEY, boolToByte(false));
  // Initialize genesis flags to false
  Storage.set(IS_GENESIS_LOCKED_KEY, boolToByte(false));
  Storage.set(IS_GENESIS_STARTED_KEY, boolToByte(false));

  // Set the contract owner
  _setOwner(Context.caller().toString());

  // Initialize the reentrancy guard
  ReentrancyGuard.__ReentrancyGuard_init();
}

/**
 * Starts the genesis prediction round. Can be called only once by the owner.
 */
export function genesisStartRound(): void {
  onlyOwner();

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));

  assert(!isGenesisStarted, 'GENESIS_CAN_BE_STARTED_ONLY_ONCE');

  const currentEpoch = bytesToU256(Storage.get(CURRENT_EPOCH_KEY));

  const newCurrentEpoch = SafeMath256.add(currentEpoch, u256.One);

  // Update current epoch
  Storage.set(CURRENT_EPOCH_KEY, u256ToBytes(newCurrentEpoch));

  // Start the first round
  // _startRound(newCurrentEpoch)

  // Update genesis started flag
  Storage.set(IS_GENESIS_STARTED_KEY, boolToByte(true));
}

/**
 * Locks the genesis prediction round. Can be called only once by the owner.
 * Also starts the next round.
 */
export function genesisLockRound(): void {
  onlyOwner();

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));
  const isGenesisLocked = byteToBool(Storage.get(IS_GENESIS_LOCKED_KEY));

  assert(isGenesisStarted, 'CAN_ONLY_LOCK_AFTER_GENESIS_STARTED');
  assert(!isGenesisLocked, 'GENESIS_CAN_BE_LOCKED_ONLY_ONCE');

  let currentEpoch = bytesToU256(Storage.get(CURRENT_EPOCH_KEY));

  // TODO: Here we would normally get the price from the oracle
  const currentPrice = u256.fromU32(1000); // Placeholder price

  // Lock the current round
  _safeLockRound(currentEpoch, currentPrice);

  // Increment epoch for the next round
  currentEpoch = SafeMath256.add(currentEpoch, u256.One);

  Storage.set(CURRENT_EPOCH_KEY, u256ToBytes(currentEpoch));

  // Start the next round
  _startRound(currentEpoch);

  // Update genesis locked flag
  Storage.set(IS_GENESIS_LOCKED_KEY, boolToByte(true));
}

/**
 * @notice Start the next round n, lock price for round n-1, end round n-2
 * @dev Callable by owner only
 */
export function executeRound(_: StaticArray<u8>): void {
  onlyOwner();

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));
  const isGenesisLocked = byteToBool(Storage.get(IS_GENESIS_LOCKED_KEY));

  assert(
    isGenesisStarted && isGenesisLocked,
    'CAN_ONLY_RUN_AFTER_GENESIS_START_AND_LOCK',
  );

  // Fetch current Price
  const currentPrice = _getTokenPrice();

  let currentEpoch = bytesToU256(Storage.get(CURRENT_EPOCH_KEY));

  // Lock round n-1 (currentEpoch is referring to round n-1)
  _safeLockRound(currentEpoch, currentPrice);

  // End round n-2
  const prevEpoch = SafeMath256.sub(currentEpoch, u256.One);
  _safeEndRound(prevEpoch, currentPrice);

  // Calculate rewards for round n-2
  _calculateRewards(prevEpoch);

  // Increment currentEpoch to current round (n)
  currentEpoch = SafeMath256.add(currentEpoch, u256.One);
  Storage.set(CURRENT_EPOCH_KEY, u256ToBytes(currentEpoch));

  // Start round n
  _safeStartRound(currentEpoch);
}

//////////////////////////////////////////// INTERNAL FUNCTIONS////////////////////////////////////////////

function _startRound(epoch: u256): void {
  const currentTimestamp = Context.timestamp();

  const intervalSeconds = bytesToU64(Storage.get(INTERVALS_SECONDS_KEY));

  const roundStartTimestamp = currentTimestamp;
  // Lock = Start + intervalSeconds
  const roundLockTimestamp = roundStartTimestamp + intervalSeconds;
  // Close = Lock + intervalSeconds = Start + 2 * intervalSeconds
  const roundCloseTimestamp = roundLockTimestamp + intervalSeconds;

  // Construct the round object
  const round = new Round(
    epoch,
    roundStartTimestamp,
    roundLockTimestamp,
    roundCloseTimestamp,
  );

  // Store the round in the rounds map
  roundsMap.set(epoch, round);

  // Emit Start Event
  generateEvent(`StartRound: epoch=${epoch.toString()}`);
}

function _safeStartRound(epoch: u256): void {
  // Can only be called when teh genesis is started
  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));

  assert(isGenesisStarted, 'GENESIS_NOT_STARTED_YET');

  // Get previous previous epoch (n-2)
  const prevPrevEpoch = SafeMath256.sub(epoch, u256.fromU32(2));

  // Get previous previous round (n-2)
  const prevPrevRound = roundsMap.getSome(prevPrevEpoch);

  // Ensure previous previous round has been closed
  assert(
    prevPrevRound.closeTimestamp != 0,
    'CAN_START_ROUND_ONLY_AFTER_ROUND_(n-2)_CLOSED',
  );

  // Ensure current time is after previous previous round's close timestamp
  assert(
    Context.timestamp() >= prevPrevRound.closeTimestamp,
    'CAN_START_ROUND_ONLY_AFTER_ROUND_(n-2)_CLOSED_TIMESTAMP',
  );

  // All checks passed, start the round
  _startRound(epoch);
}

function _safeLockRound(epoch: u256, price: u256): void {
  // Get the round of the given epoch
  const round = roundsMap.getSome(epoch);

  const currentTimestamp = Context.timestamp();

  // Ensure round has started
  assert(
    round.startTimestamp != 0,
    'CAN_ONLY_LOCK_ROUND_AFTER_ROUND_HAS_STARTED',
  );

  // Ensure current time is after or equal to lock timestamp
  assert(
    currentTimestamp >= round.lockTimestamp,
    'CAN_ONLY_LOCK_ROUND_AFTER_LOCK_TIMESTAMP',
  );

  // Get the Buffer Seconds
  const bufferSeconds = bytesToU64(Storage.get(BUFFER_SECONDS_KEY));

  // Ensure current time is within buffer seconds
  assert(
    currentTimestamp <= round.lockTimestamp + bufferSeconds,
    'CAN_ONLY_LOCK_ROUND_WITHIN_BUFFER_SECONDS',
  );

  // Get The Interval Seconds
  const intervalSeconds = bytesToU64(Storage.get(INTERVALS_SECONDS_KEY));

  // Update the round with lock information
  round.lockPrice = price;
  round.closeTimestamp = currentTimestamp + intervalSeconds;

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  // Emit Lock Event
  generateEvent(
    `LockRound: epoch=${epoch.toString()}, lockPrice=${price.toString()}`,
  );
}

/**
 * @notice End round
 * @param epoch: epoch of the round
 * @param price: price of the round
 */
function _safeEndRound(epoch: u256, price: u256): void {
  // Get the round of the given epoch
  const round = roundsMap.getSome(epoch);

  const currentTimestamp = Context.timestamp();

  // Ensure round has been locked
  assert(round.lockTimestamp != 0, 'CAN_ONLY_END_ROUND_AFTER_ROUND_HAS_LOCKED');

  // Ensure current time is after or equal to close timestamp
  assert(
    currentTimestamp >= round.closeTimestamp,
    'CAN_ONLY_END_ROUND_AFTER_CLOSE_TIMESTAMP',
  );

  const bufferSeconds = bytesToU64(Storage.get(BUFFER_SECONDS_KEY));

  // Ensure current time is within buffer seconds
  assert(
    currentTimestamp <= round.closeTimestamp + bufferSeconds,
    'CAN_ONLY_END_ROUND_WITHIN_BUFFER_SECONDS',
  );

  // Update the round with close information
  round.closePrice = price;

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  // Emit End Event
  generateEvent(
    `EndRound: epoch=${epoch.toString()}, closePrice=${price.toString()}`,
  );
}

/**
 * @notice Calculate rewards for round
 * @param epoch: epoch
 */
function _calculateRewards(epoch: u256): void {
  // Get the round of the given epoch
  const round = roundsMap.getSome(epoch);

  // Ensure rewards have not been calculated yet
  assert(
    round.rewardBaseCalAmount == u256.Zero && round.rewardAmount == u256.Zero,
    'REWARDS_ALREADY_CALCULATED',
  );

  let rewardBaseCalAmount: u256;
  let treasuryAmt: u256;
  let rewardAmount: u256;

  const treasuryFee = bytesToU32(Storage.get(TREASURY_FEE_KEY));

  // Handle Bull wins
  if (round.closePrice > round.lockPrice) {
    rewardBaseCalAmount = round.bullAmount;

    // treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
    treasuryAmt = SafeMath256.div(
      SafeMath256.mul(round.totalAmount, u256.fromU32(treasuryFee)),
      u256.fromU32(10000),
    );

    // rewardAmount = round.totalAmount - treasuryAmt;
    rewardAmount = SafeMath256.sub(round.totalAmount, treasuryAmt);
  }
  // Handle Bear wins
  else if (round.closePrice < round.lockPrice) {
    rewardBaseCalAmount = round.bearAmount;

    // treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
    treasuryAmt = SafeMath256.div(
      SafeMath256.mul(round.totalAmount, u256.fromU32(treasuryFee)),
      u256.fromU32(10000),
    );

    // rewardAmount = round.totalAmount - treasuryAmt;
    rewardAmount = SafeMath256.sub(round.totalAmount, treasuryAmt);
  }
  // Handle House wins (lockPrice == closePrice)
  else {
    rewardBaseCalAmount = u256.Zero;
    rewardAmount = u256.Zero;
    treasuryAmt = round.totalAmount;
  }

  // Update the round with reward information
  round.rewardBaseCalAmount = rewardBaseCalAmount;
  round.rewardAmount = rewardAmount;

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  const oldTreasuryAmount = bytesToU256(Storage.get(TREASURY_AMOUNT_KEY));

  // Update treasury amount
  const newTreasuryAmount = SafeMath256.add(oldTreasuryAmount, treasuryAmt);
  Storage.set(TREASURY_AMOUNT_KEY, u256ToBytes(newTreasuryAmount));

  // Emit RewardsCalculated Event
  generateEvent(
    `RewardsCalculated: epoch=${epoch.toString()}, rewardBaseCalAmount=${rewardBaseCalAmount.toString()}, rewardAmount=${rewardAmount.toString()}, treasuryAmt=${treasuryAmt.toString()}`,
  );
}

/**
 * @notice Determine if a round is valid for receiving bets
 * Round must have started and locked
 * Current timestamp must be within startTimestamp and lockTimestamp
 * @param epoch  - The epoch of the round to check
 * @returns bool - True if the round is bettable, false otherwise
 */
function _bettable(epoch: u256): bool {
  // Get the round of the given epoch
  const round = roundsMap.getSome(epoch);

  // Get current timestamp
  const currentTimestamp = Context.timestamp();

  return (
    round.startTimestamp != 0 &&
    round.lockTimestamp != 0 &&
    currentTimestamp > round.startTimestamp &&
    currentTimestamp < round.lockTimestamp
  );
}

/**
 * @notice Fetches the token price from EagleFi DEX
 * @returns u256 - The current token price
 */
function _getTokenPrice(): u256 {
  return u256.One; // Placeholder implementation
}
