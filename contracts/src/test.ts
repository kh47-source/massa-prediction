import { Account, JsonRpcProvider } from '@massalabs/massa-web3';
import { deployPredictionMarketContract } from './calls';

console.log('=== Starting Prediction Market Workflow Test ===\n');

// Setup account and provider
const account = await Account.fromEnv();
const provider = JsonRpcProvider.buildnet(account);

// Step 1: Deploy the contract
console.log('Step 1: Deploying Prediction Market Contract...');
const contract = await deployPredictionMarketContract(provider);
console.log('Contract deployed at:', contract.address);




