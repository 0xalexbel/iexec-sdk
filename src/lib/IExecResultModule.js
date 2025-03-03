import IExecModule from './IExecModule.js';
import { checkWeb2SecretExists } from '../common/sms/check.js';
import { pushWeb2Secret } from '../common/sms/push.js';
import { getResultEncryptionKeyName } from '../common/utils/secrets-utils.js';

export default class IExecResultModule extends IExecModule {
  constructor(...args) {
    super(...args);

    this.checkResultEncryptionKeyExists = async (
      address,
      { teeFramework } = {},
    ) =>
      checkWeb2SecretExists(
        await this.config.resolveContractsClient(),
        await this.config.resolveSmsURL({ teeFramework }),
        address,
        getResultEncryptionKeyName(),
      );
    this.pushResultEncryptionKey = async (
      publicKey,
      { forceUpdate = false, teeFramework } = {},
    ) =>
      pushWeb2Secret(
        await this.config.resolveContractsClient(),
        await this.config.resolveSmsURL({ teeFramework }),
        getResultEncryptionKeyName(),
        publicKey,
        { forceUpdate },
      );
  }
}
