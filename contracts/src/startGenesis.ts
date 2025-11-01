import { Account, JsonRpcProvider, SmartContract } from '@massalabs/massa-web3';
import { genesisStartRound } from './calls';

// Setup account and provider
const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

const contractAddress = 'ASDF1234EXAMPLE5678ADDRESS90GHJKL';

const contract = new SmartContract(provider, contractAddress);

await genesisStartRound(contract);
