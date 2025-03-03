export * from '../common/types.js';

import IExecConfig from './IExecConfig.js';
import IExecModule from './IExecModule.js';
import { Addressish, TeeFramework } from '../common/types.js';

/**
 * module exposing result methods
 */
export default class IExecResultModule extends IExecModule {
  /**
   * check if a beneficiary result encryption key exists in the Secret Management Service
   *
   * example:
   * ```js
   * const isEncryptionKeyAvailable = await checkResultEncryptionKeyExists(userAddress);
   * console.log('encryption key available:', isEncryptionKeyAvailable);
   * ```
   */
  checkResultEncryptionKeyExists(
    beneficiaryAddress: Addressish,
    options: { teeFramework?: TeeFramework },
  ): Promise<boolean>;
  /**
   * **SIGNER REQUIRED, ONLY BENEFICIARY**
   *
   * push a beneficiary result encryption key to the Secret Management Service to allow result encryption
   *
   * _NB_: this method will throw an error if a beneficiary result encryption key already exists in the Secret Management Service unless the option `forceUpdate: true` is used.
   *
   * example:
   * ```js
   * const { isPushed } = await pushResultEncryptionKey(
   *   `-----BEGIN PUBLIC KEY-----
   *   MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0gKRKKNCLe1O+A8nRsOc
   *   gnnvLwE+rpvmKnjOTzoR8ZBTaIjD1dqlhPyJ3kgUnKyCNqru9ayf0srUddwj+20N
   *   zdLvhI03cYD+GFYM6rrGvaUekGZ43f309f3wOrQjNkTeGo+K+hloHL/gmuN/XML9
   *   MST/01+mdCImPdG+dxk4RQAsFS7HE00VXsVjcLGeZ95AKILFJKLbCOJxxvsQ+L1g
   *   rameEwTUF1Mb5TJnV44YZJiCKYFj6/6zrZ3+pdUjxBSN96iOyE2KiYeNuhEEJbjb
   *   4rWl+TpWLmDkLIeyL3TpDTRedaXVx6h7DOOphX5vG63+5UIHol3vJwPbeODiFWH0
   *   hpFcFVPoW3wQgEpSMhUabg59Hc0rnXfM5nrIRS+SHTzjD7jpbSisGzXKcuHMc69g
   *   brEHGJsNnxr0A65PzN1RMJGq44lnjeTPZnjWjM7PnnfH72MiWmwVptB38QP5+tao
   *   UJu9HvZdCr9ZzdHebO5mCWIBKEt9bLRa2LMgAYfWVg21ARfIzjvc9GCwuu+958GR
   *   O/VhIFB71aaAxpGmK9bX5U5QN6Tpjn/ykRIBEyY0Y6CJUkc33KhVvxXSirIpcZCO
   *   OY8MsmW8+J2ZJI1JA0DIR2LHingtFWlQprd7lt6AxzcYSizeWVTZzM7trbBExBGq
   *   VOlIzoTeJjL+SgBZBa+xVC0CAwEAAQ==
   *   -----END PUBLIC KEY-----`,
   * );
   * console.log('encryption key pushed:', isPushed);
   * ```
   */
  pushResultEncryptionKey(
    rsaPublicKey: string,
    options?: {
      forceUpdate?: boolean;
      teeFramework?: TeeFramework;
    },
  ): Promise<{ isPushed: boolean; isUpdated: boolean }>;
  /**
   * Create an IExecResultModule instance using an IExecConfig instance
   */
  static fromConfig(config: IExecConfig): IExecResultModule;
}
