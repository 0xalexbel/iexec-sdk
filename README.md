# iExec SDK [![npm version](https://badge.fury.io/js/iexec.svg)](https://www.npmjs.com/package/iexec)


iExec allows Ethereum developers to create applications that can be executed off-chain.
This package brings all the tools to develop, deploy and execute Dapps on Ethereum and iExec.
Using these tools, you will be able to deploy any legacy applications in the iExec infrastructure
and execute them through calls to Ethereum smart contracts.

* A [step-by-step tutorial](https://goo.gl/REsz1j) is available on Katacoda.
* An iExec explorer is available at https://explorer.iex.ec
* A RLC faucet is available at https://faucet.iex.ec

## Install

Requirements:
[Node.js](https://nodejs.org/en/) (version >= 6) and [Git](https://git-scm.com/).
```bash
npm -g install iexec
iexec --version
iexec --help
```

> Windows users need to create an alias by running ```for /f %i in ('where iexec') do doskey iex=%i $*``` to avoid a naming conflict. Then always use ```iex``` instead of ```iexec``` when using the SDK.

You're done ! Now, let's create your first iExec application.


## Init

Init your iExec project with one of the [sample iExec dapps](https://github.com/iExecBlockchainComputing/iexec-dapp-samples/tree/master)
```bash
iexec init factorial
cd iexec-factorial  // move into new project directory
```

It will download the sample iExec project to start with.

Your iExec Dapps is composed of two parts:
1. An offchain app (under ```/apps``` directory), which can be any kind of legacy application. The offchain app will be executed by the iExec decentralised cloud.
2. A smart contract (under ```/contracts``` directory) that interfaces your iExec Dapp from Ethereum to the offchain app.


## Wallet

All interactions with the Ethereum blockchain need some ETH to pay for the transaction fees and some RLC to pay for computation fees:
```bash
iexec wallet create
iexec wallet getETH
iexec wallet getRLC
```
You can check how many ETH/RLC you have in your wallet:
```bash
iexec wallet show
```

## I deploy
Using a single command line, you can deploy your smart contract (```/contracts/Factorial.sol```) on Ethereum AND deploy your legacy application (```/apps/Factorial```) on the iExec network:
```bash
iexec deploy
```

## I exec
Depending on the price of the application you want to use, you will need to credit your iExec account with some RLC before submitting a calculation:
```
iexec account allow 5
```
Let's submit our first calculation:
```bash
iexec submit 10
```
Each submission gives you back a transaction hash, that you need to use as a parameter to get the result of the submit:
```
iexec result txHash
```

Congrats, your smart contract is "offchain computing ready!". Sky is the limit for you and your smart contract!
