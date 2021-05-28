const FakeLink = artifacts.require("FakeLink");
const FakeBancor = artifacts.require("FakeBancor");
const FakeMatic = artifacts.require("FakeMatic");
const CharacterGenerator = artifacts.require("CharacterGenerator");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(FakeLink, 1000000);
  deployer.deploy(FakeBancor, 10000);
  deployer.deploy(FakeMatic, 1000000000);
  // hardcode owner address for testing purposes ==> change for live network!
  deployer.deploy(CharacterGenerator, '0x8174aBb0B7a467328492f159A3f8074dEe424c1c', accounts[9], 2500);
};
