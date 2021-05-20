const FakeLink = artifacts.require("FakeLink");
const FakeBancor = artifacts.require("FakeBancor");
const FakeMatic = artifacts.require("FakeMatic");
const CharacterGenerator = artifacts.require("CharacterGenerator");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(FakeLink, 1000000);
  deployer.deploy(FakeBancor, 10000);
  deployer.deploy(FakeMatic, 1000000000);
  deployer.deploy(CharacterGenerator, accounts[1]);
};
