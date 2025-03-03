[iexec](../README.md) / [Exports](../modules.md) / IExecResultModule

# Class: IExecResultModule

module exposing result methods

## Hierarchy

- [`IExecModule`](IExecModule.md)

  ↳ **`IExecResultModule`**

## Table of contents

### Constructors

- [constructor](IExecResultModule.md#constructor)

### Properties

- [config](IExecResultModule.md#config)

### Methods

- [checkResultEncryptionKeyExists](IExecResultModule.md#checkresultencryptionkeyexists)
- [pushResultEncryptionKey](IExecResultModule.md#pushresultencryptionkey)
- [fromConfig](IExecResultModule.md#fromconfig)

## Constructors

### constructor

• **new IExecResultModule**(`configOrArgs`, `options?`)

Create an IExecModule instance using an IExecConfig like

#### Parameters

| Name | Type |
| :------ | :------ |
| `configOrArgs` | [`IExecConfig`](IExecConfig.md) \| [`IExecConfigArgs`](../interfaces/internal_.IExecConfigArgs.md) |
| `options?` | [`IExecConfigOptions`](../interfaces/internal_.IExecConfigOptions.md) |

#### Inherited from

[IExecModule](IExecModule.md).[constructor](IExecModule.md#constructor)

## Properties

### config

• **config**: [`IExecConfig`](IExecConfig.md)

current IExecConfig

#### Inherited from

[IExecModule](IExecModule.md).[config](IExecModule.md#config)

## Methods

### checkResultEncryptionKeyExists

▸ **checkResultEncryptionKeyExists**(`beneficiaryAddress`, `options`): `Promise`<`boolean`\>

check if a beneficiary result encryption key exists in the Secret Management Service

example:
```js
const isEncryptionKeyAvailable = await checkResultEncryptionKeyExists(userAddress);
console.log('encryption key available:', isEncryptionKeyAvailable);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `beneficiaryAddress` | `string` |
| `options` | `Object` |
| `options.teeFramework?` | [`TeeFramework`](../modules.md#teeframework) |

#### Returns

`Promise`<`boolean`\>

___

### pushResultEncryptionKey

▸ **pushResultEncryptionKey**(`rsaPublicKey`, `options?`): `Promise`<{ `isPushed`: `boolean` ; `isUpdated`: `boolean`  }\>

**SIGNER REQUIRED, ONLY BENEFICIARY**

push a beneficiary result encryption key to the Secret Management Service to allow result encryption

_NB_: this method will throw an error if a beneficiary result encryption key already exists in the Secret Management Service unless the option `forceUpdate: true` is used.

example:
```js
const { isPushed } = await pushResultEncryptionKey(
  `-----BEGIN PUBLIC KEY-----
  MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0gKRKKNCLe1O+A8nRsOc
  gnnvLwE+rpvmKnjOTzoR8ZBTaIjD1dqlhPyJ3kgUnKyCNqru9ayf0srUddwj+20N
  zdLvhI03cYD+GFYM6rrGvaUekGZ43f309f3wOrQjNkTeGo+K+hloHL/gmuN/XML9
  MST/01+mdCImPdG+dxk4RQAsFS7HE00VXsVjcLGeZ95AKILFJKLbCOJxxvsQ+L1g
  rameEwTUF1Mb5TJnV44YZJiCKYFj6/6zrZ3+pdUjxBSN96iOyE2KiYeNuhEEJbjb
  4rWl+TpWLmDkLIeyL3TpDTRedaXVx6h7DOOphX5vG63+5UIHol3vJwPbeODiFWH0
  hpFcFVPoW3wQgEpSMhUabg59Hc0rnXfM5nrIRS+SHTzjD7jpbSisGzXKcuHMc69g
  brEHGJsNnxr0A65PzN1RMJGq44lnjeTPZnjWjM7PnnfH72MiWmwVptB38QP5+tao
  UJu9HvZdCr9ZzdHebO5mCWIBKEt9bLRa2LMgAYfWVg21ARfIzjvc9GCwuu+958GR
  O/VhIFB71aaAxpGmK9bX5U5QN6Tpjn/ykRIBEyY0Y6CJUkc33KhVvxXSirIpcZCO
  OY8MsmW8+J2ZJI1JA0DIR2LHingtFWlQprd7lt6AxzcYSizeWVTZzM7trbBExBGq
  VOlIzoTeJjL+SgBZBa+xVC0CAwEAAQ==
  -----END PUBLIC KEY-----`,
);
console.log('encryption key pushed:', isPushed);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `rsaPublicKey` | `string` |
| `options?` | `Object` |
| `options.forceUpdate?` | `boolean` |
| `options.teeFramework?` | [`TeeFramework`](../modules.md#teeframework) |

#### Returns

`Promise`<{ `isPushed`: `boolean` ; `isUpdated`: `boolean`  }\>

___

### fromConfig

▸ `Static` **fromConfig**(`config`): [`IExecResultModule`](IExecResultModule.md)

Create an IExecResultModule instance using an IExecConfig instance

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`IExecConfig`](IExecConfig.md) |

#### Returns

[`IExecResultModule`](IExecResultModule.md)

#### Overrides

[IExecModule](IExecModule.md).[fromConfig](IExecModule.md#fromconfig)
