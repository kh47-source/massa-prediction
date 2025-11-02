import {
  SmartContract,
  Args,
  parseMas,
  OperationStatus,
  type Provider,
  byteToBool,
} from "@massalabs/massa-web3";
import { toast } from "react-toastify";
import {
  CONTRACT_ADDRESS,
  CURRENT_EPOCH_KEY,
  IS_GENESIS_LOCKED_KEY,
  IS_GENESIS_STARTED_KEY,
  ROUNDS_MAP_PREFIX,
} from "./const";
import { Round } from "./types";

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

    const genesisStartOp = await contract.call(
      "genesisStartRound",
      new Args(),
      {
        // coins: parseMas("0.03"),
        coins: parseMas("500"),
      }
    );

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

export async function genesisLockRound(
  provider: Provider
): Promise<{ success: boolean; error?: string }> {
  console.log("Locking genesis round...");
  const toastId = toast.loading(`Locking genesis round...`);

  try {
    const contract = new SmartContract(provider, CONTRACT_ADDRESS);

    const genesisLockOp = await contract.call("genesisLockRound", new Args(), {
      coins: parseMas("30"),
    });

    console.log("Operation ID:", genesisLockOp.id);

    toast.update(toastId, {
      render: "Waiting for transaction confirmation...",
      isLoading: true,
    });

    const status = await genesisLockOp.waitSpeculativeExecution();

    if (status == OperationStatus.SpeculativeSuccess) {
      console.log("✓ Genesis round locked successfully");
      toast.update(toastId, {
        render: "✓ Genesis round locked successfully",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { success: true };
    } else {
      const specEvents = await genesisLockOp.getSpeculativeEvents();
      console.error("Failed to lock genesis round, events:", specEvents);
      toast.update(toastId, {
        render: "✗ Failed to lock genesis round",
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      return { success: false, error: "Failed to lock genesis round" };
    }
  } catch (error) {
    console.error("Error locking genesis round:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    toast.update(toastId, {
      render: `✗ Genesis lockRound failed: ${errorMessage}`,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });
    return { success: false, error: errorMessage };
  }
}

export async function executeRound(
  provider: Provider
): Promise<{ success: boolean; error?: string }> {
  console.log("Executing round...");
  const toastId = toast.loading(`Executing round...`);

  try {
    const contract = new SmartContract(provider, CONTRACT_ADDRESS);

    const executeOp = await contract.call("executeRound", new Args(), {
      coins: parseMas("100"),
    });

    console.log("Operation ID:", executeOp.id);

    toast.update(toastId, {
      render: "Waiting for transaction confirmation...",
      isLoading: true,
    });

    const status = await executeOp.waitSpeculativeExecution();

    if (status == OperationStatus.SpeculativeSuccess) {
      console.log("✓ Round executed successfully");
      toast.update(toastId, {
        render: "✓ Round executed successfully",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { success: true };
    } else {
      const specEvents = await executeOp.getSpeculativeEvents();

      console.error("Failed to execute round, events:", specEvents);

      toast.update(toastId, {
        render: "✗ Failed to execute round",
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      return { success: false, error: "Failed to execute round" };
    }
  } catch (error) {
    console.error("Error executing round:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    toast.update(toastId, {
      render: `✗ Execute round failed: ${errorMessage}`,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });
    return { success: false, error: errorMessage };
  }
}

export async function getCurrentEpoch(provider: Provider): Promise<number> {
  const values = await provider.readStorage(
    CONTRACT_ADDRESS,
    [CURRENT_EPOCH_KEY],
    false
  );

  if (!values || values.length === 0 || values[0] === null) {
    throw new Error("Failed to fetch current epoch from storage");
  }

  return Number(new Args(values[0]).nextU64());
}

export async function getRoundDetails(
  round: bigint,
  provider: Provider
): Promise<Round> {
  const roundKey = ROUNDS_MAP_PREFIX + round.toString();

  const values = await provider.readStorage(
    CONTRACT_ADDRESS,
    [roundKey],
    false
  );

  if (!values || values.length === 0 || values[0] === null) {
    throw new Error("Failed to fetch round details from storage");
  }

  const roundData = new Args(values[0]).nextSerializable<Round>(Round);

  console.log("Fetched round details for epoch #", round, " : ", roundData);

  return roundData;
}

export async function betBull(
  provider: Provider,
  epoch: bigint,
  betAmount: bigint
): Promise<{ success: boolean; error?: string }> {
  console.log(
    `Placing BULL bet of ${betAmount.toString()} on epoch ${epoch.toString()}...`
  );
  const toastId = toast.loading(`Placing BULL bet...`);

  try {
    const contract = new SmartContract(provider, CONTRACT_ADDRESS);

    const betBullArgs = new Args().addU64(epoch).addU64(betAmount);

    const coins = betAmount + parseMas("1.5"); // Adding a small buffer for fees

    const betBullOp = await contract.call("betBull", betBullArgs, {
      coins,
    });

    console.log("Operation ID:", betBullOp.id);

    toast.update(toastId, {
      render: "Waiting for transaction confirmation...",
      isLoading: true,
    });

    const status = await betBullOp.waitSpeculativeExecution();

    if (status == OperationStatus.SpeculativeSuccess) {
      console.log(`✓ BULL bet placed successfully`);
      toast.update(toastId, {
        render: "✓ BULL bet placed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { success: true };
    } else {
      const specEvents = await betBullOp.getSpeculativeEvents();
      console.error("Failed to place BULL bet, events:", specEvents);

      toast.update(toastId, {
        render: "✗ Failed to place BULL bet",
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      return { success: false, error: "Failed to place BULL bet" };
    }
  } catch (error) {
    console.error("Error placing BULL bet:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    toast.update(toastId, {
      render: `✗ BULL bet failed: ${errorMessage}`,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });

    return { success: false, error: errorMessage };
  }
}

export async function betBear(
  provider: Provider,
  epoch: bigint,
  betAmount: bigint
): Promise<{ success: boolean; error?: string }> {
  console.log(
    `Placing BEAR bet of ${betAmount.toString()} on epoch ${epoch.toString()}...`
  );
  const toastId = toast.loading(`Placing BEAR bet...`);

  try {
    const contract = new SmartContract(provider, CONTRACT_ADDRESS);

    const betBearArgs = new Args().addU64(epoch).addU64(betAmount);

    const coins = betAmount + parseMas("1.5"); // Adding a small buffer for fees

    const betBearOp = await contract.call("betBear", betBearArgs, {
      coins,
    });

    console.log("Operation ID:", betBearOp.id);

    toast.update(toastId, {
      render: "Waiting for transaction confirmation...",
      isLoading: true,
    });

    const status = await betBearOp.waitSpeculativeExecution();

    if (status == OperationStatus.SpeculativeSuccess) {
      console.log(`✓ BEAR bet placed successfully`);
      toast.update(toastId, {
        render: "✓ BEAR bet placed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { success: true };
    } else {
      const specEvents = await betBearOp.getSpeculativeEvents();
      console.error("Failed to place BEAR bet, events:", specEvents);

      toast.update(toastId, {
        render: "✗ Failed to place BEAR bet",
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });

      return { success: false, error: "Failed to place BEAR bet" };
    }
  } catch (error) {
    console.error("Error placing BEAR bet:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    toast.update(toastId, {
      render: `✗ BEAR bet failed: ${errorMessage}`,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });

    return { success: false, error: errorMessage };
  }
}
