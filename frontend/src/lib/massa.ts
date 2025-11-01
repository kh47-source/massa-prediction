import {
  SmartContract,
  Args,
  parseMas,
  parseUnits,
  OperationStatus,
  bytesToStr,
  MRC20,
  Web3Provider,
  type Provider,
  byteToBool,
} from "@massalabs/massa-web3";
import { toast } from "react-toastify";
import {
  CONTRACT_ADDRESS,
  IS_GENESIS_LOCKED_KEY,
  IS_GENESIS_STARTED_KEY,
} from "./const";

export async function getIsGenesisStarted(
  provider: Provider
): Promise<boolean> {
  const values = await provider.readStorage(
    CONTRACT_ADDRESS,
    [IS_GENESIS_STARTED_KEY],
    false
  );

  if (!values || values.length === 0 || values[0] === null) {
    throw new Error("Failed to fetch genesis started status from storage");
  }

  return byteToBool(values[0]);
}

export async function getIsGenesisLocked(provider: Provider): Promise<boolean> {
  const values = await provider.readStorage(
    CONTRACT_ADDRESS,
    [IS_GENESIS_LOCKED_KEY],
    false
  );

  if (!values || values.length === 0 || values[0] === null) {
    throw new Error("Failed to fetch genesis locked status from storage");
  }

  return byteToBool(values[0]);
}
