import { Args } from '@massalabs/as-types';

/**
 * Serializes an array of strings into a static array of bytes.
 * @param arr - Array of strings to serialize.
 * @returns StaticArray<u8> - Serialized array of bytes.
 */
export function serializeStringArray(arr: string[]): StaticArray<u8> {
  return new Args().add(arr).serialize();
}

/**
 * Deserializes a static array of bytes into an array of strings.
 * @param arr - StaticArray<u8> to deserialize.
 * @returns Array<string> - Deserialized array of strings.
 */
export function deserializeStringArray(arr: StaticArray<u8>): string[] {
  return new Args(arr).nextStringArray().unwrapOrDefault();
}

/**
 * Generate A unique storage key for a user and a vault.
 * @param userAddr  The address of the user.
 * @param vaultAdd The address of the vault.
 * @returns  A unique storage key for the user and vault.
 */
export function generateSplitterUserKey(
  userAddr: string,
  vaultAdd: string,
): string {
  return 'SPL:' + userAddr + ':' + vaultAdd;
}
