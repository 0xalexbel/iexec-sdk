const Debug = require('debug');
const ethUtil = require('ethjs-util');
const fetch = require('cross-fetch');
const qs = require('query-string');
const BN = require('bn.js');
const ethers = require('ethers');
const { hashEIP712 } = require('./sig-utils');

const debug = Debug('iexec:utils');

/* eslint no-underscore-dangle: ["error", { "allow": ["_ethersType", "_hex", "_eventName"] }] */

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const isEthersBn = obj => !!(obj._ethersType && obj._ethersType === 'BigNumber');

const bnToEthersBn = bn => ethers.utils.bigNumberify(bn.toString());
const ethersBnToBn = ethersBn => new BN(ethersBn.toString());

const bnifyNestedEthersBn = (obj) => {
  const objOut = {};
  Object.entries(obj).forEach((e) => {
    const [k, v] = e;
    if (isEthersBn(v)) {
      objOut[k] = ethersBnToBn(v);
    } else if (typeof v === 'object' && v._hex) objOut[k] = new BN(v._hex.substring(2), 16);
    else if (typeof v === 'object') objOut[k] = bnifyNestedEthersBn(v);
    else objOut[k] = v;
  });
  return objOut;
};

const stringifyNestedBn = (obj) => {
  const objOut = {};
  Object.entries(obj).forEach((e) => {
    const [k, v] = e;
    if (v instanceof BN) objOut[k] = v.toString();
    else if (typeof v === 'object') {
      objOut[k] = stringifyNestedBn(v);
    } else objOut[k] = v;
  });
  return objOut;
};

const checksummedAddress = address => ethers.utils.getAddress(address);

const minBn = (bnArray) => {
  let min = new BN(bnArray[0]);
  bnArray.map((e) => {
    if (e.lt(min)) min = e;
    return min;
  });
  return min;
};

const getContractAddress = (desc, chainID, { strict = true } = {}) => {
  try {
    if (!('networks' in desc)) {
      if (strict) {
        throw Error('missing networks key in contract JSON description');
      }
      return undefined;
    }
    if (!(chainID in desc.networks)) {
      if (strict) {
        throw Error(`missing "${chainID}" key in contract JSON description`);
      }
      return undefined;
    }
    if (!('address' in desc.networks[chainID])) {
      if (strict) {
        throw Error(
          `missing address key in contract JSON description for chainID: ${chainID}`,
        );
      }
      return undefined;
    }
    return desc.networks[chainID].address;
  } catch (error) {
    debug('getContractAddress()', error);
    throw error;
  }
};

const isEthAddress = (address, { strict = false } = {}) => {
  const isHexString = ethUtil.isHexString(address);
  if (!isHexString && strict) {
    throw Error(`address ${address} is not a valid Ethereum address`);
  }
  return isHexString;
};

const isBytes32 = (str, { strict = true } = {}) => {
  if (typeof str !== 'string') {
    if (strict) throw new Error(`isBytes32 type missmatch, value: ${str}`);
    return false;
  }
  if (str.length !== 66) {
    if (strict) throw new Error(`isBytes32 incorrect length, value: ${str}`);
    return false;
  }
  if (str.substr(0, 2) !== '0x') {
    if (strict) throw new Error(`isBytes32 incorrect hex format, value: ${str}`);
    return false;
  }
  return true;
};

const cleanRPC = (rpcObj) => {
  const keys = Object.keys(rpcObj);
  const cleanObj = keys.reduce((accu, curr) => {
    if (Number.isNaN(parseInt(curr, 10))) {
      const value = typeof rpcObj[curr] === 'object'
        ? cleanRPC(rpcObj[curr])
        : rpcObj[curr];
      return Object.assign(accu, { [curr]: value });
    }
    return accu;
  }, {});
  return cleanObj;
};

const checkEvent = (eventName, events) => {
  let confirm = false;
  events.forEach((event) => {
    debug('event', event._eventName);
    if (event._eventName === eventName) confirm = true;
  });
  return confirm;
};

const getEventFromLogs = (eventName, events, { strict = true } = {}) => {
  let eventFound = {};
  events.forEach((event) => {
    debug('event', event._eventName);
    if (event._eventName === eventName) {
      eventFound = event;
    }
  });
  if (!eventFound && strict) throw new Error(`unknown event ${eventName}`);
  return eventFound;
};

const toUpperFirst = str => ''.concat(str[0].toUpperCase(), str.substr(1));

const secToDate = (secs) => {
  const t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
};

const API_URL = 'https://gateway.iex.ec/';
// const API_URL = 'http://localhost:3000/';

const makeBody = (verb, body) => {
  if (verb === 'GET') return {};
  return { body: JSON.stringify(body) };
};

const makeQueryString = (verb, body) => {
  if (verb === 'GET' && Object.keys(body).length !== 0) {
    return '?'.concat(qs.stringify(body));
  }
  return '';
};

const httpRequest = verb => async (
  endpoint,
  body = {},
  optionalHeaders = {},
  api = API_URL,
) => {
  const baseURL = api;
  const queryString = makeQueryString(verb, body);
  const url = baseURL.concat(endpoint, queryString);
  const headers = Object.assign(
    {
      Accept: 'application/json',
      'content-type': 'application/json',
    },
    optionalHeaders,
  );
  const response = await fetch(
    url,
    Object.assign(
      {
        method: verb,
        headers,
      },
      makeBody(verb, body),
    ),
  );
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    if (response.status === 200 && json) return json;
  } else {
    throw new Error('the http response is not of JSON type');
  }
  throw new Error('API call error');
};

const download = verb => async (
  endpoint,
  body = {},
  optionalHeaders = {},
  api = API_URL,
) => {
  const baseURL = api;
  const queryString = makeQueryString(verb, body);
  const url = baseURL.concat(endpoint, queryString);
  const headers = Object.assign(
    {
      Accept: ['application/zip'],
      'content-type': 'application/json',
    },
    optionalHeaders,
  );
  const response = await fetch(
    url,
    Object.assign(
      {
        method: verb,
        headers,
      },
      makeBody(verb, body),
    ),
  );
  if (!response.ok) {
    throw Error(
      `API call error: ${response.status} ${
        response.statusText ? response.statusText : ''
      }`,
    );
  }
  const contentType = response.headers.get('content-type');
  return {
    content: response.body,
    contentType,
  };
};

const signTypedDatav3 = async (eth, address, typedData) => {
  const signTDv3 = td => new Promise((resolve, reject) => {
    eth.sendAsync(
      {
        method: 'eth_signTypedData_v3',
        params: [address, JSON.stringify(td)],
      },
      (err, result) => {
        if (err) reject(err);
        resolve(result.result);
      },
    );
  });
  const sign = await signTDv3(typedData);
  return sign;
};

const getAuthorization = async (
  chainID,
  address,
  ethProvider,
  { apiUrl = API_URL, challengeEndpoint = 'challenge' } = {},
) => {
  try {
    const challenge = await httpRequest('GET')(
      challengeEndpoint,
      {
        chainId: chainID,
        chainID,
        address,
      },
      {},
      apiUrl,
    );
    debug('challenge', challenge);
    const typedData = challenge.data || challenge;
    debug('typedData', typedData);
    const sign = await signTypedDatav3(ethProvider, address, typedData);
    debug('sign', sign);
    const hash = hashEIP712(typedData);
    debug('hash', hash);
    const separator = '_';
    const authorization = hash
      .concat(separator)
      .concat(sign)
      .concat(separator)
      .concat(address);
    debug('authorization', authorization);
    return authorization;
  } catch (error) {
    debug('getAuthorization()', error);
    throw Error('failed to get authorization');
  }
};

const http = {
  get: httpRequest('GET'),
  post: httpRequest('POST'),
};

const getSalt = () => {
  const hex = ethers.utils
    .bigNumberify(ethers.utils.randomBytes(32))
    .toHexString()
    .substring(2);
  const salt = '0x0000000000000000000000000000000000000000000000000000000000000000'
    .substr(0, 66 - hex.length)
    .concat(hex);
  return salt;
};

module.exports = {
  getContractAddress,
  isEthAddress,
  checksummedAddress,
  isBytes32,
  cleanRPC,
  checkEvent,
  getEventFromLogs,
  minBn,
  bnToEthersBn,
  ethersBnToBn,
  bnifyNestedEthersBn,
  stringifyNestedBn,
  toUpperFirst,
  secToDate,
  getAuthorization,
  http,
  download,
  getSalt,
  NULL_ADDRESS,
};
