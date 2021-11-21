const CCR = artifacts.require("CCR");
const { catchRevert } = require("./exceptionsHelpers.js");

contract('CCR', function (accounts) {
  const [contractOwner, user1, user2, user3, user4] = accounts;
  const spendEther = 0.04
  const mintSpend = web3.utils.toWei(spendEther.toString(), 'ether');
  const mintZero = web3.utils.toWei('0', 'ether');
  const baseURL = "ipfs://QmdGmRN4rU5nttWe1ozvzJ4txUa1yXWn89QeWuzuoTwkTB/"

  beforeEach(async () => {
    instance = await CCR.new();
  });

  it("ready to be solved!", async () => {
    const eth100 = 100e18;
    assert.equal(await web3.eth.getBalance(user1), eth100.toString());
  });

  it("is fundAddress contractOwner", async () => {
    assert.equal(
      await instance.getFundAddress.call(),
      contractOwner,
      "fundAddress is not correct",
    );
  });

  it("Can get tokenURI not exist", async () => {
    await catchRevert(instance.tokenURI(1))
  })

  it("admin can mint token to user1", async () => {
    await instance.mintByAdmin([user1], { from: contractOwner, value: mintZero });
    const balance = await instance.balanceOf(user1);
    assert.equal(balance.toString(), '1', "mint token to user1 failed");
  })

  it("user can not mint token to other user", async () => {
    await catchRevert(instance.mintByAdmin([user1], { from: user1, value: mintSpend }))
  })

  it("Can get tokenURI minted NFT", async () => {
    await instance.mintByAdmin([user1], { from: contractOwner, value: mintZero });
    const token0 = await instance.tokenURI(0)
    assert.equal(
      token0.toString(), baseURL + '0', "cannot read token url"
    );
  })

  it("user can not mint NFT without set whitelist", async () => {
    await catchRevert(instance.mint({ from: user1, value: mintSpend }));
  })

  it("default whitelistEndDate is current add 1 day", async () => {
    const whitelistEndDate = await instance.whitelistEndDate.call();
    assert.equal(
      whitelistEndDate.toString() * 1000 < Date.now() + 1000 * 60 * 60 * 24
      && whitelistEndDate.toString() * 1000 > Date.now(),
      true,
      "default whitelistEndDate is not set correctly");
  })

  it("admin can set setwhitelistEndDate", async () => {
    const oldWhitelistEndDate = await instance.whitelistEndDate.call();
    const newWhitelistEndDate = oldWhitelistEndDate + 60;
    await instance.setwhitelistEndDate(newWhitelistEndDate, { from: contractOwner }); // 1 minutes later
    const whitelistEndDate = await instance.whitelistEndDate.call();
    assert.equal(
      whitelistEndDate.toString() === newWhitelistEndDate,
      true,
      "whitelistEndDate is not set correctly");
  })

  it("user can not set whitelistEndDate", async () => {
    const oldWhitelistEndDate = await instance.whitelistEndDate.call();
    await catchRevert(instance.setwhitelistEndDate(oldWhitelistEndDate + 60, { from: user1 }));
  })

  it("admin can add addresses to whitelist", async () => {
    await instance.addToWhitelist([user1, user2, user3], { from: contractOwner });
    const user1IsInWhitelist = await instance.isInWhitelist(user1);
    const user2IisInWhitelist = await instance.isInWhitelist(user2);
    const user3IisInWhitelist = await instance.isInWhitelist(user3);
    const user4IisNotInWhitelist = await instance.isInWhitelist(user4);
    assert.equal(
      user1IsInWhitelist && user2IisInWhitelist && user3IisInWhitelist && !user4IisNotInWhitelist,
      true,
      "address is not add to whitelist correctly");
  })

  it("user can not set whitelist", async () => {
    await catchRevert(instance.addToWhitelist([user4], { from: user1 }));
  })

  it("before whitelistEndDate, only people in whiltelist can mint", async () => {
    await instance.addToWhitelist([user1], { from: contractOwner });
    await instance.mint({ from: user1, value: mintZero });
    await catchRevert(instance.mint({ from: user4, value: mintSpend }));
  })

  it("after whitelistEndBlockDate, anyone can mint by spend ethers", async () => {
    const balanceAdmin = await web3.eth.getBalance(contractOwner);
    const balanceUser4 = await web3.eth.getBalance(user4);

    const startDate = (await web3.eth.getBlock()).timestamp
    await catchRevert(instance.mint({ from: user4, value: mintSpend }));
    const newWhitelistEndDate = startDate - 1;
    await instance.setwhitelistEndDate(newWhitelistEndDate, { from: contractOwner });
    await instance.mint({ from: user4, value: mintSpend });
    // check balance
    const balanceAdminAfterMint = await web3.eth.getBalance(contractOwner);
    const balanceUser4AfterMint = await web3.eth.getBalance(user4);
    const adminEtherDifference = web3.utils.fromWei((balanceAdminAfterMint - balanceAdmin).toString(), 'ether')
    const userEtherDifference = web3.utils.fromWei((balanceUser4AfterMint - balanceUser4).toString(), 'ether')
    console.log('difference', userEtherDifference - spendEther)
    assert.equal(Math.abs(adminEtherDifference - spendEther) < 0.1, true, "admin ether recieve is not correct");
    assert.equal(Math.abs(userEtherDifference - spendEther) < 0.1, true, "user ether spend is not correct");
  })

  it("Can read remain supply", async () => {
    const remainSupplyBeforeMint = await instance.getRemainingSupply();
    assert.equal(remainSupplyBeforeMint.toString(), '500', "remain supply is not correct");
    await instance.mintByAdmin([user1], { from: contractOwner, value: mintZero });
    const remainSupplyAfterMint = await instance.getRemainingSupply();
    assert.equal(remainSupplyAfterMint.toString(), '499', "remain supply is not correct");
  })

  it("User in whitelist can only mint 2 times", async () => {
    await instance.addToWhitelist([user1], { from: contractOwner });
    await instance.mint({ from: user1, value: mintZero });
    await instance.mint({ from: user1, value: mintSpend });
    await catchRevert(instance.mint({ from: user1, value: mintSpend }));
    assert.equal(await instance.balanceOf(user1), '2', "user should has 2 NFTs");
  })

  it("User in whitelist second NFT should pay", async () => {
    await instance.addToWhitelist([user1], { from: contractOwner });
    await instance.mint({ from: user1, value: mintZero });
    assert.equal(await instance.getMintedCount(user1), '1', "user should have minted 1 NFT");
    await catchRevert(instance.mint({ from: user1, value: mintZero }));
    await instance.mint({ from: user1, value: mintSpend });
    assert.equal(await instance.getMintedCount(user1), '2', "user should have minted 2 NFTs");
    assert.equal(await instance.balanceOf(user1), '2', "user should has 2 NFTs");
  })
});