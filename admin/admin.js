const { Wallet, providers, Contract, utils } = require("ethers");
require('dotenv').config()
const ccrABI = require('../build/contracts/CCR.json').abi
const airdropList = require('./airdrop.json')
const whiteList = require('./whitelist.json')

async function main() {
  const isMainnet = true

  let wallet = new Wallet.fromMnemonic(process.env.MNEMONIC)
  // change flashbots rpc on mainnet
  const provider = new providers.InfuraProvider(isMainnet ? 1 : 4, process.env.INFURA_API_KEY || '');
  wallet = wallet.connect(provider)
  // rinkeby
  const ccrAddress = isMainnet ? '0x81Ca1F6608747285c9c001ba4f5ff6ff2b5f36F8' : '0xd0a9bc1F6D47e777950CF5dB032886FB779aAAC1'
  const ccrContract = new Contract(ccrAddress, ccrABI, provider);

  // admin address
  // const adminAddress = wallet.address
  // console.log('adminAddress: ', adminAddress)

  // 剩余数量
  // const remainAmount = (await ccrContract.getRemainingSupply()).toNumber()
  // console.log('remainAmount', remainAmount);
  // 已mint数
  // const mintedCount = (await ccrContract.getMintedCount(adminAddress)).toNumber()
  // add whitelist
  // const tx = await ccrContract.connect(wallet).addToWhitelist(whiteList.map(v => v.address)) // 3.6M gas
  // await tx.wait();
  // console.log(`https://${isMainnet ? '' : 'rinkeby.'}etherscan.io/tx/` + tx.hash);

  // airdrop
  // const airdropAddresses = airdropList.map(v => v.address)
  // const tx = await ccrContract.connect(wallet).mintByAdmin(
  //   airdropAddresses, {
  //   gasPrice: utils.parseUnits('70', 'gwei'),
  //   gasLimit: 10_000_000
  // }
  // ) // 10M gas
  // await tx.wait();
  // console.log(`https://${isMainnet ? '' : 'rinkeby.'}etherscan.io/tx/` + tx.hash);

}
main()
