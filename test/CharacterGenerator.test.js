const truffleAssert = require('truffle-assertions');

const CharacterGenerator = artifacts.require("CharacterGenerator");
const FakeLink = artifacts.require("FakeLink");
const FakeBancor = artifacts.require("FakeBancor");
const FakeMatic = artifacts.require("FakeMatic");

contract("CharacterGenerator", (accounts) => {
  let receiver = accounts[1];
  let characterGenerator;
  let fakeLink;
  let fakeBancor;
  let fakeMatic;

  before(async () => {
    characterGenerator = await CharacterGenerator.deployed()
    fakeLink = await FakeLink.deployed();
    fakeBancor = await FakeBancor.deployed();
    fakeMatic = await FakeMatic.deployed();
  })

  describe("Deployment", async () => {
    it("Sets the receiver to be accounts[1]", async () => {
      let actualReceiver = await characterGenerator.receiver()
      assert.equal(receiver, actualReceiver, "Receiver should be set to accounts[1]")
    })
  })

  describe("#generate()", async () => {

    it("Transfers the specified quantity of each token to itself", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10000', 'ether')]

      let generatorAddress = characterGenerator.address
      
      fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
      fakeMatic.approve(generatorAddress, web3.utils.toWei('10000', 'ether'), { from: accounts[0] })

      await characterGenerator.generate(tokenAddresses, tokenQuantities)

      let generatorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      generatorLinkBalance = web3.utils.fromWei(generatorLinkBalance, 'ether')

      let generatorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      generatorMaticBalance = web3.utils.fromWei(generatorMaticBalance, 'ether')

      assert.equal(generatorLinkBalance, 100)
      assert.equal(generatorMaticBalance, 10000)
    })

    it("Does not transfer unless ALL allowances are properly set", async () => {
      let tokenAddresses = [fakeLink.address, fakeBancor.address]
      let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10000', 'ether')]

      let generatorAddress = characterGenerator.address
      
      fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
      // don't set fBNT allowance

      let initialLinkBalance = await fakeLink.balanceOf(generatorAddress)
      initialLinkBalance = web3.utils.fromWei(initialLinkBalance, 'ether')

      truffleAssert.reverts(characterGenerator.generate(tokenAddresses, tokenQuantities))
    })
  })

})