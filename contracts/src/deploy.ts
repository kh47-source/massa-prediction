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

const contract = await deployPredictionMarketContract(provider);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
