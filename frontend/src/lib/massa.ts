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

export async function genesisStartRound(
  provider: Provider
): Promise<{ success: boolean; error?: string }> {
  console.log("Starting genesis round...");
  const toastId = toast.loading(`Starting genesis round...`);

  try {
    const contract = new SmartContract(provider, CONTRACT_ADDRESS);

    const genesisStartOp = await contract.call("genesisStartRound", new Args());

    console.log("Operation ID:", genesisStartOp.id);

    toast.update(toastId, {
      render: "Waiting for transaction confirmation...",
      isLoading: true,
    });

    const status = await genesisStartOp.waitSpeculativeExecution();

    if (status == OperationStatus.SpeculativeSuccess) {
      console.log("✓ Genesis round started successfully");
      toast.update(toastId, {
        render: "✓ Genesis round started successfully",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { success: true };
    } else {
      const specEvents = await genesisStartOp.getSpeculativeEvents();
      console.error("Failed to start genesis round, events:", specEvents);

      toast.update(toastId, {
        render: "✗ Failed to start genesis round",
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      return { success: false, error: "Failed to start genesis round" };
    }
  } catch (error) {
    console.error("Error starting genesis round:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    toast.update(toastId, {
      render: `✗ Genesis startRound failed: ${errorMessage}`,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });

    return { success: false, error: errorMessage };
  }
}
