import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
  parseMas,
  OperationStatus,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

export async function deployPredictionMarketContract(
  provider: JsonRpcProvider,
  intervalSeconds = 300000,
  bufferSeconds = 60000,
): Promise<SmartContract> {
  console.log('Deploying contract...');

  const byteCode = getScByteCode('build', 'main.wasm');

  // MAS-USDC Liquidity Pool Address (Dusa)
  const poolAddress = 'AS112Wdy9pM4fvLNLHQXyf7uam9waMPdG5ekr4vxCyQHPkrMMPPY';
  const treasuryFee = 10 * 100; // 10%
  const minBetAmount = parseMas('1');

  const constructorArgs = new Args()
    .addString(poolAddress)
    .addU32(BigInt(treasuryFee))
    .addU64(minBetAmount)
    .addU64(BigInt(intervalSeconds))
    .addU64(BigInt(bufferSeconds))
    .serialize();

  const contract = await SmartContract.deploy(
    provider,
    byteCode,
    constructorArgs,
    { coins: Mas.fromString('0.06') },
  );

  console.log('Contract deployed at:', contract.address);

  return contract;
}

export async function genesisStartRound(
  contract: SmartContract,
): Promise<void> {
  console.log('Starting genesis round...');

  const genesisStartOp = await contract.call('genesisStartRound', new Args());

  console.log('Operation ID:', genesisStartOp.id);

  const status = await genesisStartOp.waitSpeculativeExecution();

  if (status == OperationStatus.SpeculativeSuccess) {
    console.log('✓ Genesis round started successfully');
  } else {
    const specEvents = await genesisStartOp.getSpeculativeEvents();
    console.error('✗ Failed to start genesis round');
    console.error('Speculative Events:', specEvents);
    throw new Error('✗ Failed to start genesis round');
  }
}

export async function genesisLockRound(contract: SmartContract): Promise<void> {
  console.log('Locking genesis round...');

  const genesisLockOp = await contract.call('genesisLockRound', new Args());

  console.log('Operation ID:', genesisLockOp.id);

  const status = await genesisLockOp.waitSpeculativeExecution();

  if (status == OperationStatus.SpeculativeSuccess) {
    console.log('✓ Genesis round locked successfully');
  } else {
    const specEvents = await genesisLockOp.getSpeculativeEvents();
    console.error('✗ Failed to lock genesis round');
    console.error('Speculative Events:', specEvents);
    throw new Error('✗ Failed to lock genesis round');
  }
}

export async function executeRound(
  contract: SmartContract,
  epoch: bigint,
): Promise<void> {
  console.log(`Executing round for epoch ${epoch.toString()}...`);

  const executeOp = await contract.call(
    'executeRound',
    new Args().addU64(epoch),
  );

  console.log('Operation ID:', executeOp.id);

  const status = await executeOp.waitSpeculativeExecution();

  if (status == OperationStatus.SpeculativeSuccess) {
    console.log(`✓ Round for epoch ${epoch.toString()} executed successfully`);
  } else {
    const specEvents = await executeOp.getSpeculativeEvents();
    console.error(`✗ Failed to execute round for epoch ${epoch.toString()}`);
    console.error('Speculative Events:', specEvents);
    throw new Error(`✗ Failed to execute round for epoch ${epoch.toString()}`);
  }
}

export async function betBull(
  contract: SmartContract,
  epoch: bigint,
  amount: number,
): Promise<void> {
  console.log(
    `Placing BULL bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}...`,
  );

  const parsedAmount = parseMas(amount.toString());

  const betBullArgs = new Args().addU64(epoch).addU64(parsedAmount);

  const coins = parsedAmount + parseMas('0.01'); // Adding a small buffer for fees

  const betBullOp = await contract.call('betBull', betBullArgs, {
    coins,
  });

  console.log('Operation ID:', betBullOp.id);

  const status = await betBullOp.waitSpeculativeExecution();

  if (status == OperationStatus.SpeculativeSuccess) {
    console.log(
      `✓ BULL bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()} placed successfully`,
    );
  } else {
    const specEvents = await betBullOp.getSpeculativeEvents();
    console.error(
      `✗ Failed to place BULL bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}`,
    );
    console.error('Speculative Events:', specEvents);
    throw new Error(
      `✗ Failed to place BULL bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}`,
    );
  }
}

export async function betBear(
  contract: SmartContract,
  epoch: bigint,
  amount: number,
): Promise<void> {
  console.log(
    `Placing BEAR bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}...`,
  );

  const parsedAmount = parseMas(amount.toString());

  const betBearArgs = new Args().addU64(epoch).addU64(parsedAmount);

  const coins = parsedAmount + parseMas('0.01'); // Adding a small buffer for fees

  const betBearOp = await contract.call('betBear', betBearArgs, {
    coins,
  });

  console.log('Operation ID:', betBearOp.id);

  const status = await betBearOp.waitSpeculativeExecution();

  if (status == OperationStatus.SpeculativeSuccess) {
    console.log(
      `✓ BEAR bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()} placed successfully`,
    );
  } else {
    const specEvents = await betBearOp.getSpeculativeEvents();
    console.error(
      `✗ Failed to place BEAR bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}`,
    );
    console.error('Speculative Events:', specEvents);
    throw new Error(
      `✗ Failed to place BEAR bet of ${amount.toString()} nanoMAS on epoch ${epoch.toString()}`,
    );
  }
}
