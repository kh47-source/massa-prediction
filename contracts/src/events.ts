import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

dotenv.config();

const account = await Account.fromEnv('PRIVATE_KEY');
const provider = Web3Provider.buildnet(account);

const events = await provider.getEvents({
  // callerAddress: account.address.toString(),
  callerAddress: 'AS12iAdbnXgaFXM25Ax6WwhPxGHh2NJQQJ47s1J4p9WZTDrvWVvtS',
});

for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Done Evenst');
