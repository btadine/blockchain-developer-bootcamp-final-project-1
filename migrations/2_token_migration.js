const CCR = artifacts.require("CCR");

module.exports = function (deployer) {
  deployer.deploy(CCR, "ipfs://QmdGmRN4rU5nttWe1ozvzJ4txUa1yXWn89QeWuzuoTwkTB/");
};