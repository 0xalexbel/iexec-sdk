const createIExecContracts = require('iexec-contracts-js-client');
const wallet = require('./wallet');
const account = require('./account');
const hub = require('./hub');
const order = require('./order');
const orderbook = require('./orderbook');
const deal = require('./deal');
const task = require('./task');
const errors = require('./errors');
const {
  BN,
  NULL_ADDRESS,
  NULL_BYTES32,
  getSalt,
  checksummedAddress,
  isEthAddress,
  isBytes32,
  encodeTag,
  decodeTag,
} = require('./utils');

const utils = {
  BN,
  NULL_ADDRESS,
  NULL_BYTES32,
  getSalt,
  isEthAddress,
  isBytes32,
  checksummedAddress,
  encodeTag,
  decodeTag,
};

class IExec {
  constructor({ ethProvider, chainId, hubAddress }) {
    const contracts = createIExecContracts({
      ethProvider,
      chainId,
      hubAddress,
    });
    this.wallet = {};
    this.wallet.getAddress = () => wallet.getAddress(contracts);
    this.wallet.checkBalances = address => wallet.checkBalances(contracts, address);
    this.wallet.sendETH = (weiAmount, to) => wallet.sendETH(contracts, weiAmount, to);
    this.wallet.sendRLC = (nRlcAmount, to) => wallet.sendRLC(contracts, nRlcAmount, to);
    this.wallet.sweep = to => wallet.checkBalances(contracts, null, to);
    this.account = {};
    this.account.checkBalance = address => account.checkBalance(contracts, address);
    this.account.deposit = nRlcAmount => account.deposit(contracts, nRlcAmount);
    this.account.withdraw = nRlcAmount => account.withdraw(contracts, nRlcAmount);
    this.app = {};
    this.app.deployApp = app => hub.deployApp(contracts, app);
    this.app.showApp = address => hub.showApp(contracts, address);
    this.app.showUserApp = (index, userAddress) => hub.showUserApp(contracts, index, userAddress);
    this.app.countUserApps = address => hub.countUserApps(contracts, address);
    this.dataset = {};
    this.dataset.deployDataset = dataset => hub.deployDataset(contracts, dataset);
    this.dataset.showDataset = address => hub.showDataset(contracts, address);
    this.dataset.showUserDataset = (index, userAddress) => hub.showUserDataset(contracts, index, userAddress);
    this.dataset.countUserDatasets = address => hub.countUserDatasets(contracts, address);
    this.workerpool = {};
    this.workerpool.deployWorkerpool = workerpool => hub.deployWorkerpool(contracts, workerpool);
    this.workerpool.showWorkerpool = address => hub.showWorkerpool(contracts, address);
    this.workerpool.showUserWorkerpool = (index, userAddress) => hub.showUserWorkerpool(contracts, index, userAddress);
    this.workerpool.countUserWorkerpools = address => hub.countUserWorkerpools(contracts, address);
    this.hub = {};
    this.hub.createCategory = category => hub.createCategory(contracts, category);
    this.hub.showCategory = index => hub.showCategory(contracts, index);
    this.hub.countCategory = () => hub.countCategory(contracts);
    this.hub.getTimeoutRatio = () => hub.getTimeoutRatio(contracts);
    this.deal = {};
    this.deal.show = dealid => deal.show(contracts, dealid);
    this.deal.computeTaskId = (dealid, taskIdx) => deal.computeTaskId(dealid, taskIdx);
    this.deal.fetchRequesterDeals = (
      requesterAddress,
      {
        appAddress, datasetAddress, workerpoolAddress, beforeTimestamp,
      } = {},
    ) => deal.fetchRequesterDeals(contracts.chainId, requesterAddress, {
      appAddress,
      datasetAddress,
      workerpoolAddress,
      beforeTimestamp,
    });
    // this.deal.fetchDealsByApporder = apporderHash => order.fetchDealsByOrderHash(
    //   order.APP_ORDER,
    //   contracts.chainId,
    //   apporderHash,
    // );
    // this.deal.fetchDealsByDatasetorder = datasetorderHash => order.fetchDealsByOrderHash(
    //   order.DATASET_ORDER,
    //   contracts.chainId,
    //   datasetorderHash,
    // );
    // this.deal.fetchDealsByWorkerpoolorder = workerpoolorderHash => order.fetchDealsByOrderHash(
    //   order.WORKERPOOL_ORDER,
    //   contracts.chainId,
    //   workerpoolorderHash,
    // );
    // this.deal.fetchDealsByRequestorder = requestorderHash => order.fetchDealsByOrderHash(
    //   order.REQUEST_ORDER,
    //   contracts.chainId,
    //   requestorderHash,
    // );
    this.order = {};
    this.order.createApporder = overwrite => order.createApporder(overwrite);
    this.order.createDatasetorder = overwrite => order.createDatasetorder(overwrite);
    this.order.createWorkerpoolorder = overwrite => order.createWorkerpoolorder(overwrite);
    this.order.createRequestorder = overwrite => order.createRequestorder(overwrite);
    this.order.signApporder = apporder => order.signApporder(contracts, apporder);
    this.order.signDatasetorder = datasetorder => order.signDatasetorder(contracts, datasetorder);
    this.order.signWorkerpoolorder = workerpoolorder => order.signWorkerpoolorder(contracts, workerpoolorder);
    this.order.signRequestorder = requestorder => order.signRequestorder(contracts, requestorder);
    this.order.cancelApporder = signedApporder => order.cancelApporder(contracts, signedApporder);
    this.order.cancelDatasetorder = signedDatasetorder => order.cancelDatasetorder(contracts, signedDatasetorder);
    this.order.cancelWorkerpoolorder = signedWorkerpoolorder => order.cancelWorkerpoolorder(contracts, signedWorkerpoolorder);
    this.order.cancelRequestorder = signedRequestorder => order.cancelRequestorder(contracts, signedRequestorder);
    this.order.publishApporder = signedApporder => order.publishApporder(contracts, signedApporder);
    this.order.publishDatasetorder = signedDatasetorder => order.publishDatasetorder(contracts, signedDatasetorder);
    this.order.publishWorkerpool = signedWorkerpoolorder => order.publishWorkerpoolorder(contracts, signedWorkerpoolorder);
    this.order.publishRequestorder = signedRequestorder => order.publishRequestorder(contracts, signedRequestorder);
    this.order.unpublishApporder = apporderHash => order.unpublishApporder(contracts, apporderHash);
    this.order.unpublishDatasetorder = datasetorderHash => order.unpublishDatasetorder(contracts, datasetorderHash);
    this.order.unpublishWorkerpool = workerpoolorderHash => order.unpublishWorkerpoolorder(contracts, workerpoolorderHash);
    this.order.unpublishRequestorder = requestorderHash => order.unpublishRequestorder(contracts, requestorderHash);
    this.order.matchOrders = ({
      apporder,
      datasetorder = order.NULL_DATASETORDER,
      workerpoolorder,
      requestorder,
    } = {}) => order.matchOrders(
      contracts,
      apporder,
      datasetorder,
      workerpoolorder,
      requestorder,
    );
    this.orderbook = {};
    this.orderbook.fetchApporder = apporderHash => order.fetchPublishedOrderByHash(
      order.APP_ORDER,
      contracts.chainId,
      apporderHash,
    );
    this.orderbook.fetchDatasetorder = datasetorderHash => order.fetchPublishedOrderByHash(
      order.DATASET_ORDER,
      contracts.chainId,
      datasetorderHash,
    );
    this.orderbook.fetchWorkerpoolorder = workerpoolorderHash => order.fetchPublishedOrderByHash(
      order.WORKERPOOL_ORDER,
      contracts.chainId,
      workerpoolorderHash,
    );
    this.orderbook.fetchRequestorder = requestorderHash => order.fetchPublishedOrderByHash(
      order.REQUEST_ORDER,
      contracts.chainId,
      requestorderHash,
    );
    this.orderbook.fetchAppOrderbook = (appAddress, options = {}) => orderbook.fetchAppOrderbook(contracts.chainId, appAddress, options);
    this.orderbook.fetchDatasetOrderbook = (datasetAddress, options = {}) => orderbook.fetchDatasetOrderbook(
      contracts.chainId,
      datasetAddress,
      options,
    );
    this.orderbook.fetchWorkerpoolOrderbook = (category, options = {}) => orderbook.fetchWorkerpoolOrderbook(contracts.chainId, category, options);
    this.orderbook.fetchRequestOrderbook = (category, options = {}) => orderbook.fetchRequestOrderbook(contracts.chainId, category, options);
    this.task = {};
    this.task.show = taskid => task.show(contracts, taskid);
    this.task.claim = taskid => task.claim(contracts, taskid);
    this.task.fetchResults = (taskid, { ipfsGatewayURL } = {}) => task.fetchResults(contracts, taskid, { ipfsGatewayURL });
    this.task.waitForTaskStatusChange = (taskid, initialStatus) => task.waitForTaskStatusChange(contracts, taskid, initialStatus);
  }
}

const sdk = {
  IExec,
  errors,
  utils,
  wallet, // deprecated
  account, // deprecated
  order, // deprecated
  orderbook, // deprecated
  deal, // deprecated
  task, // deprecated
  hub, // deprecated
};

module.exports = sdk;
