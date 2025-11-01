import { formatMas, formatUnits } from "@massalabs/massa-web3";
import { Position, Round } from "./types";
import { PRICE_FORMAT_DECIMALS } from "./const";

export const shortenAddress = (address: string, chars = 10): string => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const getTimeRemaining = (timestamp: bigint): string => {
  const now = Date.now();
  const target = Number(timestamp);
  // const diff = Math.abs(target - now);
  const diff = target - now;

  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const calculatePayout = (position: Position, round: Round): string => {
  const totalAmount = Number(formatMas(round.totalAmount));
  const bullAmount = Number(formatMas(round.bullAmount));
  const bearAmount = Number(formatMas(round.bearAmount));

  if (totalAmount === 0) return "0.00";

  const payout =
    position === Position.Bull
      ? totalAmount / (bullAmount || 1)
      : totalAmount / (bearAmount || 1);

  return payout.toFixed(2);
};

export function formatPrice(price: bigint, decFix = 3): string {
  return (1 / Number(formatUnits(price, PRICE_FORMAT_DECIMALS))).toFixed(decFix);
}
