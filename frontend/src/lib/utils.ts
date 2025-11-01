export const shortenAddress = (address: string, chars = 10): string => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};
