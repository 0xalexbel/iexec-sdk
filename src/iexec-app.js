#!/usr/bin/env node

const cli = require('commander');
const multiaddr = require('multiaddr');
const {
  help,
  addGlobalOptions,
  addWalletLoadOptions,
  computeWalletLoadOptions,
  handleError,
  desc,
  option,
  Spinner,
  pretty,
  info,
} = require('./cli-helper');
const hub = require('./hub');
const {
  loadIExecConf,
  initObj,
  saveDeployedObj,
  loadDeployedObj,
} = require('./fs');
const { Keystore } = require('./keystore');
const { loadChain } = require('./chains');
const { NULL_ADDRESS } = require('./utils');

const objName = 'app';

const init = cli.command('init');
addGlobalOptions(init);
addWalletLoadOptions(init);
init.description(desc.initObj(objName)).action(async (cmd) => {
  const spinner = Spinner(cmd);
  try {
    const walletOptions = await computeWalletLoadOptions(cmd);
    const keystore = Keystore(walletOptions);
    const [address] = await keystore.accounts();
    const { saved, fileName } = await initObj(objName, {
      overwrite: { owner: address },
    });
    spinner.succeed(
      `Saved default ${objName} in "${fileName}", you can edit it:${pretty(
        saved,
      )}`,
      { raw: { app: saved } },
    );
  } catch (error) {
    handleError(error, cli, cmd);
  }
});

const deploy = cli.command('deploy');
addGlobalOptions(deploy);
addWalletLoadOptions(deploy);
deploy
  .option(...option.chain())
  .description(desc.deployObj(objName))
  .action(async (cmd) => {
    const spinner = Spinner(cmd);
    try {
      const walletOptions = await computeWalletLoadOptions(cmd);
      const keystore = Keystore(walletOptions);
      const [chain, iexecConf] = await Promise.all([
        loadChain(cmd.chain, keystore, { spinner }),
        loadIExecConf(),
      ]);
      const appMultiaddrBuffer = multiaddr(iexecConf[objName].multiaddr).buffer;
      const appMREnclaveBuffer = Buffer.from(
        iexecConf[objName].mrenclave,
        'utf8',
      );
      const appToDeploy = Object.assign({}, iexecConf[objName], {
        multiaddr: appMultiaddrBuffer,
        mrenclave: appMREnclaveBuffer,
      });

      spinner.start(info.deploying(objName));
      const address = await hub.createObj(objName)(
        chain.contracts,
        appToDeploy,
      );
      spinner.succeed(`Deployed new ${objName} at address ${address}`, {
        raw: { address },
      });
      await saveDeployedObj(objName, chain.id, address);
    } catch (error) {
      handleError(error, cli, cmd);
    }
  });

const show = cli.command('show [addressOrIndex]');
addGlobalOptions(show);
addWalletLoadOptions(show);
show
  .option(...option.chain())
  .option(...option.user())
  .description(desc.showObj(objName))
  .action(async (cliAddressOrIndex, cmd) => {
    const spinner = Spinner(cmd);
    try {
      const walletOptions = await computeWalletLoadOptions(cmd);
      const keystore = Keystore(walletOptions);
      const [chain, [address], deployedObj] = await Promise.all([
        loadChain(cmd.chain, keystore, { spinner }),
        keystore.accounts(),
        loadDeployedObj(objName),
      ]);

      const userAddress = cmd.user || (address !== NULL_ADDRESS && address);
      if (!userAddress) throw Error(`Missing option ${option.user()[0]} or wallet`);

      const addressOrIndex = cliAddressOrIndex || deployedObj[chain.id];

      if (!addressOrIndex) throw Error(info.missingAddress(objName));

      spinner.start(info.showing(objName));
      const { obj, objAddress } = await hub.showObj(objName)(
        chain.contracts,
        addressOrIndex,
        userAddress,
      );
      spinner.succeed(`${objName} ${objAddress} details:${pretty(obj)}`, {
        raw: { address: objAddress, app: obj },
      });
    } catch (error) {
      handleError(error, cli, cmd);
    }
  });

const count = cli.command('count');
addGlobalOptions(count);
addWalletLoadOptions(count);
count
  .option(...option.chain())
  .option(...option.user())
  .description(desc.countObj(objName))
  .action(async (cmd) => {
    const spinner = Spinner(cmd);
    const walletOptions = await computeWalletLoadOptions(cmd);
    const keystore = Keystore(walletOptions);
    try {
      const [chain, [address]] = await Promise.all([
        loadChain(cmd.chain, keystore, { spinner }),
        keystore.accounts(),
      ]);
      const userAddress = cmd.user || (address !== NULL_ADDRESS && address);
      if (!userAddress) throw Error(`Missing option ${option.user()[0]} or wallet`);
      spinner.start(info.counting(objName));
      const objCountBN = await hub.countObj(objName)(
        chain.contracts,
        userAddress,
      );
      spinner.succeed(
        `User ${userAddress} has a total of ${objCountBN} ${objName}`,
        { raw: { count: objCountBN.toString() } },
      );
    } catch (error) {
      handleError(error, cli, cmd);
    }
  });

help(cli);
