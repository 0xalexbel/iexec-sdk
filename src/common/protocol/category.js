import Debug from 'debug';
import {
  ethersBnToBn,
  bnifyNestedEthersBn,
  getEventFromLogs,
  checkSigner,
} from '../utils/utils.js';
import {
  uint256Schema,
  categorySchema,
  throwIfMissing,
} from '../utils/validator.js';
import { wrapCall, wrapSend, wrapWait } from '../utils/errorWrappers.js';

const debug = Debug('iexec:protocol:category');

export const createCategory = async (
  contracts = throwIfMissing(),
  obj = throwIfMissing(),
) => {
  try {
    checkSigner(contracts);
    const vCategory = await categorySchema().validate(obj);
    const iexecContract = contracts.getIExecContract();
    const categoryOwner = await wrapCall(iexecContract.owner());
    const userAddress = await contracts.signer.getAddress();
    if (!(categoryOwner === userAddress)) {
      throw Error(
        `only category owner ${categoryOwner} can create new categories`,
      );
    }
    const args = [
      vCategory.name,
      vCategory.description,
      vCategory.workClockTimeRef,
    ];
    const tx = await wrapSend(
      iexecContract.createCategory(...args, contracts.txOptions),
    );
    const txReceipt = await wrapWait(tx.wait(contracts.confirms));
    const { catid } = getEventFromLogs('CreateCategory', txReceipt.events, {
      strict: true,
    }).args;
    const txHash = txReceipt.transactionHash;
    return { catid, txHash };
  } catch (error) {
    debug('createCategory()', error);
    throw error;
  }
};

export const showCategory = async (
  contracts = throwIfMissing(),
  index = throwIfMissing(),
) => {
  try {
    const vIndex = await uint256Schema().validate(index);
    const iexecContract = contracts.getIExecContract();
    const categoryRPC = await wrapCall(iexecContract.viewCategory(vIndex));
    const categoryPropNames = ['name', 'description', 'workClockTimeRef'];
    const category = categoryRPC.reduce(
      (acc, curr, i) =>
        Object.assign(acc, {
          [categoryPropNames[i]]: curr,
        }),
      {},
    );
    return bnifyNestedEthersBn(category);
  } catch (error) {
    debug('showCategory()', error);
    throw error;
  }
};

export const countCategory = async (contracts = throwIfMissing()) => {
  try {
    return ethersBnToBn(
      await wrapCall(contracts.getIExecContract().countCategory()),
    );
  } catch (error) {
    debug('countCategory()', error);
    throw error;
  }
};
