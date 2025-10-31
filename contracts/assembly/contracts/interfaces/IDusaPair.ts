import { Args, stringToBytes } from '@massalabs/as-types';
import { Address, call, Storage } from '@massalabs/massa-as-sdk';
import { FeeParameters } from '../structs/dusa/FeeParameters';
import { PairInformation } from '../structs/dusa/PairInfo';

/// @dev The fee parameters that are used to calculate fees
export const FEES_PARAMETERS = stringToBytes('FEES_PARAMETERS');

export class IDusaPair {
  _origin: Address;

  /**
   * Wraps a smart contract exposing standard token FFI.
   *
   * @param {Address} at - Address of the smart contract.
   */
  constructor(at: Address) {
    this._origin = at;
  }

  /**
   * Get the fees parameters for this pair
   *
   */
  feeParameters(): FeeParameters {
    const bs = Storage.getOf(this._origin, FEES_PARAMETERS);
    return new Args(bs).nextSerializable<FeeParameters>().unwrap();
  }

  getPairInformation(): PairInformation {
    const res = call(this._origin, 'getPairInformation', new Args(), 0);
    return new Args(res).nextSerializable<PairInformation>().unwrap();
  }
}
