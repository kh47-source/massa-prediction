import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
  parseMas,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'main.wasm');

// MAS-USDC Liquidity Pool Address (Dusa)
const poolAddress = 'AS112Wdy9pM4fvLNLHQXyf7uam9waMPdG5ekr4vxCyQHPkrMMPPY';
const treasuryFee = 10 * 100; // 10%
const minBetAmount = parseMas('1');
const intervalSeconds = 300; // 5 minutes
const bufferSeconds = 60; // 1 minute

const constructorArgs = new Args()
  .addString(poolAddress)
  .addU32(BigInt(treasuryFee))
  .addU256(minBetAmount)
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

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
