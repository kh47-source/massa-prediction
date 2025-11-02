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
import { deployPredictionMarketContract } from './calls';

const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

const intervalsMin = 10; // 10 minutes
const bufferMin = 1440; // 1 day

const contract = await deployPredictionMarketContract(
  provider,
  intervalsMin * 60 * 1000,
  bufferMin * 60 * 1000,
);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
