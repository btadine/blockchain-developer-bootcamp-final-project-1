const { Wallet, providers, Contract } = require("ethers");
require('dotenv').config()
const ccrABI = require('../build/contracts/CCR.json').abi


async function main() {
  let wallet = new Wallet.fromMnemonic(process.env.MNEMONIC)
  const provider = new providers.InfuraProvider(4, process.env.INFURA_API_KEY || '');
  wallet = wallet.connect(provider)
  // rinkeby
  const ccrAddrees = '0xcFF34F53bcb34BDFC2E11215c84568BFdC03C9c9'
  const ccrContract = new Contract(ccrAddrees, ccrABI, provider);

  // admin 地址
  const adminAddress = wallet.address
  // 剩余数量
  const remainAmount = (await ccrContract.getRemainingSupply()).toNumber()
  // 已mint数
  const mintedCount = (await ccrContract.getMintedCount(adminAddress)).toNumber()
  // add whitelist
  // const tx = await ccrContract.connect(wallet).addToWhitelist(["0x49E53Fb3d5bf1532fEBAD88a1979E33A94844d1d"])

  // airdrop
  // const tx = await ccrContract.connect(wallet).mintByAdmin(["0x49E53Fb3d5bf1532fEBAD88a1979E33A94844d1d"])
  // await tx.wait();
  // console.log("https://rinkeby.etherscan.io/tx/" + tx.hash);
  // tokenURI
  console.log(await ccrContract.baseURI())
}
main()
