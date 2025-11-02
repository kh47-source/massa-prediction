/**
 * PredictionMarket contract for Massa blockchain
 * Uses Dusa Spot Price for price feeds instead of oracles (due to lack of oracle support on Massa)
 */

import {
  Address,
  balance,
  Context,
  createEvent,
  deferredCallCancel,
  deferredCallExists,
  deferredCallQuote,
  deferredCallRegister,
  findCheapestSlot,
  generateEvent,
  remainingGas,
  Storage,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  boolToByte,
  bytesToNativeTypeArray,
  bytesToU64,
  bytesToU32,
  byteToBool,
  nativeTypeArrayToBytes,
  stringToBytes,
  u32ToBytes,
  u64ToBytes,
  SafeMath,
} from '@massalabs/as-types';
import { _setOwner, OWNER_KEY } from './lib/ownership-internal';
import { ReentrancyGuard } from './lib/ReentrancyGuard';
import { MAX_TREASURY_FEE } from './lib/constants';
import { onlyOwner } from './lib/ownership';
import { Round } from './structs/round';
import { PersistentMap } from './lib/PersistentMap';
import { BetInfo } from './structs/betInfo';
import { IDusaPair } from './interfaces/IDusaPair';
import { BinHelper } from './lib/dusaBinHelper';

// Storage keys

// Pool address taht will use to fetch token price
const POOL_ADDRESS_KEY: string = 'pa';
// Pool bin step
const POOL_BIN_STEP_KEY: StaticArray<u8> = stringToBytes('pbs');
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
// Deferred call ID for automated round execution
const CURRENT_CALL_ID_KEY: StaticArray<u8> = stringToBytes('ccid');
// Automation enabled flag
const AUTOMATION_ENABLED_KEY: StaticArray<u8> = stringToBytes('ae');
// Persistent Map for rounds
const roundsMap = new PersistentMap<u64, Round>('tr');
// Prefix for UserRounds storage keys
const USER_ROUNDS_PREFIX = 'ur_';
// Prefix for BetInfo storage keys
const BET_USER_INFO_PREFIX = 'bet_';

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

  const poolAddress = args.nextString().expect('POOL_ADDRESS_ARG_MISSING');
  const treasuryFee = args.nextU32().expect('TREASURY_FEE_ARG_MISSING');
  const minBetAmount = args.nextU64().expect('MIN_BET_AMOUNT_ARG_MISSING');
  const intervalSeconds = args.nextU64().expect('INTERVAL_SECONDS_ARG_MISSING');
  const bufferSeconds = args.nextU64().expect('BUFFER_SECONDS_ARG_MISSING');

  assert(
    treasuryFee <= MAX_TREASURY_FEE,
    'TREASURY_FEE_CANNOT_EXCEED_10_PERCENT',
  );

  // Fetch pool Bin Step from Dusa Pool address
  const poolContract = new IDusaPair(new Address(poolAddress));

  const feeParameters = poolContract.feeParameters();

  const binStep = feeParameters.binStep;

  // Store initial configuration in storage
  Storage.set(POOL_ADDRESS_KEY, poolAddress);
  Storage.set(POOL_BIN_STEP_KEY, u32ToBytes(binStep));

  Storage.set(TREASURY_FEE_KEY, u32ToBytes(treasuryFee));
  Storage.set(MIN_BET_AMOUNT_KEY, u64ToBytes(minBetAmount));
  Storage.set(INTERVALS_SECONDS_KEY, u64ToBytes(intervalSeconds));
  Storage.set(BUFFER_SECONDS_KEY, u64ToBytes(bufferSeconds));

  // Initialize current epoch to 0
  Storage.set(CURRENT_EPOCH_KEY, u64ToBytes(0));

  // Initialize treasury amount to 0
  Storage.set(TREASURY_AMOUNT_KEY, u64ToBytes(0));

  // Initialize contract as unpaused
  Storage.set(PAUSED_KEY, boolToByte(false));
  // Initialize genesis flags to false
  Storage.set(IS_GENESIS_LOCKED_KEY, boolToByte(false));
  Storage.set(IS_GENESIS_STARTED_KEY, boolToByte(false));

  // Initialize automation as enabled by default
  Storage.set(AUTOMATION_ENABLED_KEY, boolToByte(true));

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

  const currentEpoch = bytesToU64(Storage.get(CURRENT_EPOCH_KEY));

  const newCurrentEpoch = SafeMath.add(currentEpoch, 1);

  // Update current epoch
  Storage.set(CURRENT_EPOCH_KEY, u64ToBytes(newCurrentEpoch));

  // Start the first round
  _startRound(newCurrentEpoch);

  // Update genesis started flag
  Storage.set(IS_GENESIS_STARTED_KEY, boolToByte(true));

  // Schedule the first automated genesisLockRound call
  _scheduleGenesisLockRound();
}

/**
 * Locks the genesis prediction round. Can be called only once by the owner.
 * Also starts the next round.
 */
export function genesisLockRound(): void {
  _onlyOwnerOrCallee();

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));
  const isGenesisLocked = byteToBool(Storage.get(IS_GENESIS_LOCKED_KEY));

  assert(isGenesisStarted, 'CAN_ONLY_LOCK_AFTER_GENESIS_STARTED');
  assert(!isGenesisLocked, 'GENESIS_CAN_BE_LOCKED_ONLY_ONCE');

  let currentEpoch = bytesToU64(Storage.get(CURRENT_EPOCH_KEY));

  // Fetch current Price
  const currentPrice = _getTokenPrice();

  // Lock the current round
  _safeLockRound(currentEpoch, currentPrice);

  // Increment epoch for the next round
  currentEpoch = SafeMath.add(currentEpoch, 1);

  Storage.set(CURRENT_EPOCH_KEY, u64ToBytes(currentEpoch));

  // Start the next round
  _startRound(currentEpoch);

  // Update genesis locked flag
  Storage.set(IS_GENESIS_LOCKED_KEY, boolToByte(true));

  // Schedule the first automated executeRound call
  _scheduleNextRound();
}

/**
 * @notice Start the next round n, lock price for round n-1, end round n-2
 * @dev Automatically called via deferred calls after genesisLockRound
 */
export function executeRound(_: StaticArray<u8>): void {
  // Only owner or callee (deferred call) can execute this function
  _onlyOwnerOrCallee();

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));
  const isGenesisLocked = byteToBool(Storage.get(IS_GENESIS_LOCKED_KEY));

  assert(
    isGenesisStarted && isGenesisLocked,
    'CAN_ONLY_RUN_AFTER_GENESIS_START_AND_LOCK',
  );

  // Fetch current Price
  const currentPrice = _getTokenPrice();

  let currentEpoch = bytesToU64(Storage.get(CURRENT_EPOCH_KEY));

  // Lock round n-1 (currentEpoch is referring to round n-1)
  _safeLockRound(currentEpoch, currentPrice);

  // End round n-2
  const prevEpoch = SafeMath.sub(currentEpoch, 1);
  _safeEndRound(prevEpoch, currentPrice);

  // Calculate rewards for round n-2
  _calculateRewards(prevEpoch);

  // Increment currentEpoch to current round (n)
  currentEpoch = SafeMath.add(currentEpoch, 1);
  Storage.set(CURRENT_EPOCH_KEY, u64ToBytes(currentEpoch));

  // Start round n
  _safeStartRound(currentEpoch);

  // Schedule the next executeRound call automatically
  _scheduleNextRound();
}

/**
 * @notice Bet bear position
 * @param epoch: epoch
 */
export function betBear(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const epoch = args.nextU64().expect('EPOCH_ARG_MISSING');
  const betAmount = args.nextU64().expect('BET_AMOUNT_ARG_MISSING');

  const minBetAmount = bytesToU64(Storage.get(MIN_BET_AMOUNT_KEY));
  const currentEpoch = bytesToU64(Storage.get(CURRENT_EPOCH_KEY));

  assert(epoch == currentEpoch, 'BET_IS_TOO_EARLY_OR_LATE');
  assert(_bettable(epoch), 'ROUND_NOT_BETTABLE');
  assert(
    betAmount >= minBetAmount,
    'BET_AMOUNT_MUST_BE_GREATER_THAN_MIN_BET_AMOUNT',
  );

  // Get the transferred coins on the TX
  const transferredCoins = Context.transferredCoins();

  assert(
    transferredCoins >= betAmount,
    'TRANSFERRED_COINS_MUST_LARGER_THAN_BET_AMOUNT',
  );

  // CHECK: User should not have already bet in this round
  const userAddress = Context.caller().toString();

  const betInfoKey = _betUserInfoKey(epoch, userAddress);

  assert(!Storage.has(betInfoKey), 'CAN_ONLY_BET_ONCE_PER_ROUND');

  // Update round data
  const round = roundsMap.getSome(epoch);

  round.totalAmount = SafeMath.add(round.totalAmount, betAmount);
  round.bearAmount = SafeMath.add(round.bearAmount, betAmount);

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  // Update user BetInfo
  const betInfo = new BetInfo(Position.Bear, betAmount, false);

  Storage.set(betInfoKey, betInfo.serialize());

  // Update userRounds mapping
  const userRounds = _getUserRounds(userAddress);

  userRounds.push(epoch);

  _updateUserRounds(userAddress, userRounds);

  // Emit Bet Event
  generateEvent(
    `BetBear: user=${userAddress}, epoch=${epoch.toString()}, amount=${betAmount.toString()}`,
  );
}

/**
 * @notice Bet bull position
 * @param epoch: epoch
 */
export function betBull(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const epoch = args.nextU64().expect('EPOCH_ARG_MISSING');
  const betAmount = args.nextU64().expect('BET_AMOUNT_ARG_MISSING');

  const minBetAmount = bytesToU64(Storage.get(MIN_BET_AMOUNT_KEY));
  const currentEpoch = bytesToU64(Storage.get(CURRENT_EPOCH_KEY));

  assert(epoch == currentEpoch, 'BET_IS_TOO_EARLY_OR_LATE');
  assert(_bettable(epoch), 'ROUND_NOT_BETTABLE');
  assert(
    betAmount >= minBetAmount,
    'BET_AMOUNT_MUST_BE_GREATER_THAN_MIN_BET_AMOUNT',
  );

  // Get the transferred coins on the TX
  const transferredCoins = Context.transferredCoins();

  assert(
    transferredCoins >= betAmount,
    'TRANSFERRED_COINS_MUST_LARGER_THAN_BET_AMOUNT',
  );

  // CHECK: User should not have already bet in this round
  const userAddress = Context.caller().toString();

  const betInfoKey = _betUserInfoKey(epoch, userAddress);

  assert(!Storage.has(betInfoKey), 'CAN_ONLY_BET_ONCE_PER_ROUND');

  // Update round
  const round = roundsMap.getSome(epoch);

  round.totalAmount = SafeMath.add(round.totalAmount, betAmount);
  round.bullAmount = SafeMath.add(round.bullAmount, betAmount);

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  // Update user BetInfo
  const betInfo = new BetInfo(Position.Bull, betAmount, false);

  Storage.set(betInfoKey, betInfo.serialize());

  // Update userRounds mapping
  const userRounds = _getUserRounds(userAddress);

  userRounds.push(epoch);

  _updateUserRounds(userAddress, userRounds);

  // Emit Bet Event
  generateEvent(
    `BetBull: user=${userAddress}, epoch=${epoch.toString()}, amount=${betAmount.toString()}`,
  );
}

/**
 * @notice Claim reward for an array of epochs
 * @param epochs: array of epochs
 */
export function claim(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const epochs = args.nextFixedSizeArray<u64>().expect('EPOCHS_ARG_MISSING');

  let reward: u64 = 0; // Initializes reward

  const userAddress = Context.caller().toString();

  for (let i = 0; i < epochs.length; i++) {
    const epoch = epochs[i];

    const round = roundsMap.getSome(epoch);

    assert(round.startTimestamp != 0, 'ROUND_HAS_NOT_STARTED');
    assert(Context.timestamp() > round.closeTimestamp, 'ROUND_HAS_NOT_ENDED');

    const isClaimable = _claimable(epoch, userAddress);

    assert(isClaimable, 'NOT_ELIGIBLE_FOR_CLAIM');

    // Get User BetInfo
    const betInfoKey = _betUserInfoKey(epoch, userAddress);

    const betInfo = new Args(Storage.get(betInfoKey))
      .nextSerializable<BetInfo>()
      .expect('INVALID_BET_INFO');

    // addedReward = betInfo.amount * round.rewardAmount / round.rewardBaseCalAmount;
    let addedReward: u64 = SafeMath.div(
      SafeMath.mul(betInfo.amount, round.rewardAmount),
      round.rewardBaseCalAmount,
    );

    // Update Bet Info as claimed
    betInfo.claimed = true;
    Storage.set(betInfoKey, betInfo.serialize());

    // Update total reward
    reward = SafeMath.add(reward, addedReward);

    // Emit Claim Event
    generateEvent(
      `Claim: user=${userAddress}, epoch=${epoch.toString()}, amount=${addedReward.toString()}`,
    );
  }

  if (reward > 0) {
    // Check the contract has enough balance to pay the reward
    const contractBalance = balance();

    assert(
      contractBalance >= reward,
      'CONTRACT_HAS_NOT_ENOUGH_BALANCE_TO_CLAIM_REWARD',
    );

    // Transfer the reward to the user
    transferCoins(new Address(userAddress), reward);
  }
}

/**
 * @notice Get If User hash claimable bet for specific round
 * @param epoch: epoch
 * @param user: user address
 * @return StaticArray<u8> - bool serialized as StaticArray<u8>
 */
export function claimable(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);

  const epoch = args.nextU64().expect('EPOCH_ARG_MISSING');
  const userAddress = args.nextString().expect('USER_ADDRESS_ARG_MISSING');

  const isClaimable = _claimable(epoch, userAddress);

  return boolToByte(isClaimable);
}

//////////////////////////////////////////// INTERNAL FUNCTIONS////////////////////////////////////////////

function _startRound(epoch: u64): void {
  const currentTimestamp = Context.timestamp();

  const intervalSeconds = bytesToU64(Storage.get(INTERVALS_SECONDS_KEY));

  const roundStartTimestamp = currentTimestamp;
  // Lock = Start + intervalSeconds
  const roundLockTimestamp = roundStartTimestamp + intervalSeconds;
  // Close = Lock + intervalSeconds = Start + 2 * intervalSeconds
  const roundCloseTimestamp = roundLockTimestamp + intervalSeconds;

  // Construct the round object
  let round = new Round(
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

function _safeStartRound(epoch: u64): void {
  // Can only be called when teh genesis is started
  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));

  assert(isGenesisStarted, 'GENESIS_NOT_STARTED_YET');

  // Get previous previous epoch (n-2)
  const prevPrevEpoch = SafeMath.sub(epoch, 2);

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

function _safeLockRound(epoch: u64, price: u64): void {
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
    'CAN_ONLY_LOCK_ROUND_AFTER_LOCK_TIMESTAMP_' +
      epoch.toString() +
      '_' +
      round.lockTimestamp.toString() +
      '<' +
      currentTimestamp.toString(),
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
function _safeEndRound(epoch: u64, price: u64): void {
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
function _calculateRewards(epoch: u64): void {
  // Get the round of the given epoch
  const round = roundsMap.getSome(epoch);

  // Ensure rewards have not been calculated yet
  assert(
    round.rewardBaseCalAmount == 0 && round.rewardAmount == 0,
    'REWARDS_ALREADY_CALCULATED',
  );

  let rewardBaseCalAmount: u64;
  let treasuryAmt: u64;
  let rewardAmount: u64;

  const treasuryFee = bytesToU32(Storage.get(TREASURY_FEE_KEY));

  // Handle Bull wins
  if (round.closePrice > round.lockPrice) {
    rewardBaseCalAmount = round.bullAmount;

    // treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
    treasuryAmt = SafeMath.div(
      SafeMath.mul(round.totalAmount, treasuryFee),
      10000,
    );

    // rewardAmount = round.totalAmount - treasuryAmt;
    rewardAmount = SafeMath.sub(round.totalAmount, treasuryAmt);
  }
  // Handle Bear wins
  else if (round.closePrice < round.lockPrice) {
    rewardBaseCalAmount = round.bearAmount;

    // treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
    treasuryAmt = SafeMath.div(
      SafeMath.mul(round.totalAmount, treasuryFee),
      10000,
    );

    // rewardAmount = round.totalAmount - treasuryAmt;
    rewardAmount = SafeMath.sub(round.totalAmount, treasuryAmt);
  }
  // Handle House wins (lockPrice == closePrice)
  else {
    rewardBaseCalAmount = 0;
    rewardAmount = 0;
    treasuryAmt = round.totalAmount;
  }

  // Update the round with reward information
  round.rewardBaseCalAmount = rewardBaseCalAmount;
  round.rewardAmount = rewardAmount;

  // Store the updated round back in the map
  roundsMap.set(epoch, round);

  const oldTreasuryAmount = bytesToU64(Storage.get(TREASURY_AMOUNT_KEY));

  // Update treasury amount
  const newTreasuryAmount = SafeMath.add(oldTreasuryAmount, treasuryAmt);
  Storage.set(TREASURY_AMOUNT_KEY, u64ToBytes(newTreasuryAmount));

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
function _bettable(epoch: u64): bool {
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
 * @notice Internal function to check if user can claim reward for specific round
 * @param epoch: epoch
 * @param userAddress: user address
 * @return bool - true if user can claim, false otherwise
 */
function _claimable(epoch: u64, userAddress: string): bool {
  const betInfoKey = _betUserInfoKey(epoch, userAddress);

  if (!Storage.has(betInfoKey)) {
    return false;
  }

  const betInfo = new Args(Storage.get(betInfoKey))
    .nextSerializable<BetInfo>()
    .expect('INVALID_BET_INFO');

  const round = roundsMap.getSome(epoch);

  // House Win round.
  if (round.lockPrice == round.closePrice) {
    return false;
  }

  const isClaimable =
    betInfo.amount != 0 &&
    !betInfo.claimed &&
    ((round.closePrice > round.lockPrice &&
      betInfo.position == Position.Bull) ||
      (round.closePrice < round.lockPrice &&
        betInfo.position == Position.Bear));

  return isClaimable;
}

/**
 * @notice Fetches the token price from EagleFi DEX
 * @returns u64 - The current token price
 */
function _getTokenPrice(): u64 {
  const poolAddress = Storage.get(POOL_ADDRESS_KEY);

  const poolContract = new IDusaPair(new Address(poolAddress));

  const pairInfo = poolContract.getPairInformation();

  return BinHelper.getPriceFromId(
    pairInfo.activeId as u64,
    bytesToU32(Storage.get(POOL_BIN_STEP_KEY)) as u64,
  ).toU64();
}

function _betUserInfoKey(epoch: u64, userAddress: string): StaticArray<u8> {
  return stringToBytes(
    BET_USER_INFO_PREFIX + epoch.toString() + '_' + userAddress,
  );
}

function _userRoundsKey(userAddress: string): StaticArray<u8> {
  return stringToBytes(USER_ROUNDS_PREFIX + userAddress);
}

function _getUserRounds(userAddress: string): u64[] {
  const userRoundsKey = _userRoundsKey(userAddress);

  if (!Storage.has(userRoundsKey)) {
    return new Array<u64>();
  }

  const data = Storage.get(userRoundsKey);

  return bytesToNativeTypeArray<u64>(data);
}

function _updateUserRounds(userAddress: string, rounds: u64[]): void {
  const userRoundsKey = _userRoundsKey(userAddress);

  Storage.set(userRoundsKey, nativeTypeArrayToBytes<u64>(rounds));
}

/**
 * @notice Ensures that the caller is either the contract owner or the contract itself (deferred call)
 * @dev Used to restrict access to certain functions that can be called by deferred calls
 */
function _onlyOwnerOrCallee(): void {
  const callee = Context.callee().toString();
  const Caller = Context.caller().toString();

  // Allow if called by the contract itself (Deferred call)
  if (callee === Caller) {
    return;
  } else {
    onlyOwner();
  }
}

/**
 * @notice Schedules the next executeRound call using Massa deferred calls
 * @dev This function is called after genesisLockRound and after each executeRound
 */
function _scheduleNextRound(): void {
  generateEvent(
    createEvent('SCHEDULING_NEXT_ROUND_REMMAINING_GAS', [
      remainingGas().toString(),
    ]),
  );

  // Check if automation is enabled
  const automationEnabled = byteToBool(Storage.get(AUTOMATION_ENABLED_KEY));

  if (!automationEnabled) {
    return;
  }

  const intervalSeconds = bytesToU64(Storage.get(INTERVALS_SECONDS_KEY)) / 1000; // Convert ms to seconds

  // Create empty arguments for executeRound (it takes empty args)
  const executeRoundArgs = new Args().serialize();

  const paramsSize = executeRoundArgs.length;
  // Set max gas for executeRound execution
  const maxGas = 900_000_000; // 900M gas should be enough for executeRound

  // Calculate the target period: current period + (intervalSeconds / 16)
  // Massa has ~16 second periods, so we convert seconds to periods
  const currentPeriod = Context.currentPeriod();
  const periodsToWait = intervalSeconds / 16; // Convert seconds to periods (16s per period)
  const bookingPeriod = currentPeriod + periodsToWait + 2; // +1 to avoid rounding issues of the division

  // Find the cheapest slot for the deferred call
  const slot = findCheapestSlot(
    bookingPeriod,
    bookingPeriod + 5, // Allow a window of 5 periods
    maxGas,
    paramsSize,
  );

  // Get the cost quote for the deferred call
  const cost = deferredCallQuote(slot, maxGas, paramsSize);

  // Register the deferred call to executeRound
  const callId = deferredCallRegister(
    Context.callee().toString(),
    'executeRound',
    slot,
    maxGas,
    executeRoundArgs,
    0, // No coins to transfer
  );

  // Save the current call ID to storage for potential cancellation
  // Store the callId as a string using Args serialization
  const callIdArgs = new Args().add(callId).serialize();
  Storage.set(CURRENT_CALL_ID_KEY, callIdArgs);

  // Emit an event for the scheduled round
  generateEvent(
    createEvent('ROUND_SCHEDULED', [
      callId,
      bookingPeriod.toString(),
      currentPeriod.toString(),
      cost.toString(),
    ]),
  );
}

/**
 * @notice Schedules the genesisLockRound call using Massa deferred calls
 * @dev This an internal function called after genesisStartRound
 *
 */
function _scheduleGenesisLockRound(): void {
  const intervalSeconds = bytesToU64(Storage.get(INTERVALS_SECONDS_KEY)) / 1000; // Convert ms to seconds

  // Create empty arguments for genesisLockRound (it takes empty args)
  const genesisLockRoundArgs = new Args().serialize();

  const paramsSize = genesisLockRoundArgs.length;

  // Set max gas for genesisLockRound execution
  const maxGas = 900_000_000; // 1B gas should be enough for genesisLockRound

  // Calculate the target period: current period + (intervalSeconds / 16)
  // Massa has ~16 second periods, so we convert seconds to periods
  const currentPeriod = Context.currentPeriod();
  const periodsToWait = intervalSeconds / 16; // Convert seconds to periods (16s per period)
  const bookingPeriod = currentPeriod + periodsToWait + 2; // +1 to avoid rounding issues of the division

  // Find the cheapest slot for the deferred call
  const slot = findCheapestSlot(
    bookingPeriod,
    bookingPeriod + 5, // Allow a window of 5 periods
    maxGas,
    paramsSize,
  );

  // Get the cost quote for the deferred call
  const cost = deferredCallQuote(slot, maxGas, paramsSize);

  // Register the deferred call to genesisLockRound
  const callId = deferredCallRegister(
    Context.callee().toString(),
    'genesisLockRound',
    slot,
    maxGas,
    genesisLockRoundArgs,
    0, // No coins to transfer
  );

  // Save the current call ID to storage for potential cancellation
  // Store the callId as a string using Args serialization
  const callIdArgs = new Args().add(callId).serialize();
  Storage.set(CURRENT_CALL_ID_KEY, callIdArgs);

  // Emit an event for the scheduled genesis lock round
  generateEvent(
    createEvent('GENESIS_LOCK_ROUND_SCHEDULED', [
      callId,
      bookingPeriod.toString(),
      currentPeriod.toString(),
      cost.toString(),
    ]),
  );
}

/**
 * @notice Pauses the automated round execution
 * @dev Only callable by the owner. Cancels the scheduled deferred call if it exists
 */
export function pauseAutomation(): void {
  onlyOwner();

  const automationEnabled = byteToBool(Storage.get(AUTOMATION_ENABLED_KEY));

  assert(automationEnabled, 'AUTOMATION_ALREADY_PAUSED');

  // Cancel the scheduled deferred call if it exists
  if (Storage.has(CURRENT_CALL_ID_KEY)) {
    const currentCallIdBytes = Storage.get(CURRENT_CALL_ID_KEY);
    // Convert bytes back to string using Args
    const currentCallId = new Args(currentCallIdBytes)
      .nextString()
      .expect('CALL_ID_INVALID');

    if (deferredCallExists(currentCallId)) {
      deferredCallCancel(currentCallId);
    }

    // Clean up the call ID from storage
    Storage.del(CURRENT_CALL_ID_KEY);
  }

  // Update automation state to disabled
  Storage.set(AUTOMATION_ENABLED_KEY, boolToByte(false));

  // Emit an event indicating automation has been paused
  generateEvent(
    createEvent('AUTOMATION_PAUSED', [Context.caller().toString()]),
  );
}

/**
 * @notice Resumes the automated round execution
 * @dev Only callable by the owner. Schedules the next executeRound call
 */
export function resumeAutomation(): void {
  onlyOwner();

  const automationEnabled = byteToBool(Storage.get(AUTOMATION_ENABLED_KEY));

  assert(!automationEnabled, 'AUTOMATION_ALREADY_ENABLED');

  const isGenesisStarted = byteToBool(Storage.get(IS_GENESIS_STARTED_KEY));
  const isGenesisLocked = byteToBool(Storage.get(IS_GENESIS_LOCKED_KEY));

  assert(
    isGenesisStarted && isGenesisLocked,
    'CAN_ONLY_RESUME_AFTER_GENESIS_LOCK',
  );

  // Update automation state to enabled
  Storage.set(AUTOMATION_ENABLED_KEY, boolToByte(true));

  // Schedule the next round
  _scheduleNextRound();

  // Emit an event indicating automation has been resumed
  generateEvent(
    createEvent('AUTOMATION_RESUMED', [Context.caller().toString()]),
  );
}
