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
  let private_key = '705f9ecaebb6707472671b86c5a309f1741b7c339e6c64dc5f02957a4d1ad533'
  let fresh_account = web3.eth.accounts.privateKeyToAccount(private_key)
  let generatorAddress;

  before(async () => {
    characterGenerator = await CharacterGenerator.deployed()
    generatorAddress = characterGenerator.address
    fakeLink = await FakeLink.deployed();
    fakeBancor = await FakeBancor.deployed();
    fakeMatic = await FakeMatic.deployed();

    // Give the first several accounts some tokens
    await fakeLink.transfer(accounts[1], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeLink.transfer(accounts[2], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeLink.transfer(accounts[3], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeLink.transfer(accounts[4], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeLink.transfer(accounts[5], web3.utils.toWei('100', 'ether'), { from: accounts[0] })

    await fakeBancor.transfer(accounts[1], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeBancor.transfer(accounts[2], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeBancor.transfer(accounts[3], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeBancor.transfer(accounts[4], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeBancor.transfer(accounts[5], web3.utils.toWei('100', 'ether'), { from: accounts[0] })

    await fakeMatic.transfer(accounts[1], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeMatic.transfer(accounts[2], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeMatic.transfer(accounts[3], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeMatic.transfer(accounts[4], web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    await fakeMatic.transfer(accounts[5], web3.utils.toWei('100', 'ether'), { from: accounts[0] })

    // set max allowances ==> not for account 5!
    await fakeLink.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[0] })
    await fakeLink.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[1] })
    await fakeLink.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[2] })
    await fakeLink.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[3] })
    await fakeLink.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[4] })

    await fakeBancor.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[0] })
    await fakeBancor.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[1] })
    await fakeBancor.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[2] })
    await fakeBancor.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[3] })
    await fakeBancor.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[4] })

    await fakeMatic.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[0] })
    await fakeMatic.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[1] })
    await fakeMatic.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[2] })
    await fakeMatic.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[3] })
    await fakeMatic.approve(generatorAddress, web3.utils.toWei('100000000', 'ether'), { from: accounts[4] })
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
      let tokenQuantities = [web3.utils.toWei('3', 'ether'), web3.utils.toWei('5', 'ether')]
      
      let taker = accounts[2]
      let message = web3.utils.soliditySha3(taker)
      let signature = await web3.eth.accounts.sign(message, private_key)

      let initialGeneratorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      initialGeneratorLinkBalance = web3.utils.fromWei(initialGeneratorLinkBalance, 'ether')

      let initialGeneratorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      initialGeneratorMaticBalance = web3.utils.fromWei(initialGeneratorMaticBalance, 'ether')

      let result = await characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities, 
        taker, 
        signature.signature,
        { from: taker }
      )

      let newGeneratorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      newGeneratorLinkBalance = web3.utils.fromWei(newGeneratorLinkBalance, 'ether')

      let newGeneratorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      newGeneratorMaticBalance = web3.utils.fromWei(newGeneratorMaticBalance, 'ether')

      assert.equal(parseInt(newGeneratorLinkBalance), parseInt(initialGeneratorLinkBalance) + 3)
      assert.equal(parseInt(newGeneratorMaticBalance), parseInt(initialGeneratorMaticBalance) + 5)
    })

    it("Does not transfer unless ALL allowances are properly set", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('2', 'ether'), web3.utils.toWei('4', 'ether')]
      
      let taker = accounts[5] // no allowances set!
      let message = web3.utils.soliditySha3(taker)
      let signature = await web3.eth.accounts.sign(message, private_key)

      // truffleAssert.reverts(, "Insufficent Allowance Provide")
      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        signature.signature,
        { from: taker }
      ), "Insufficent Allowance Provided")
    })

    // it("Won't allow a transfer if the specified taker doesn't match the sender", async () => {
    //   let tokenAddresses = [fakeLink.address]
    //   let tokenQuantities = [web3.utils.toWei('100', 'ether')]
    //   let taker = accounts[0] // specify the wrong taker

    //   fakeLink.transfer(accounts[3], web3.utils.toWei('100', 'ether'), { from: accounts[0] })

    //   let generatorAddress = characterGenerator.address

    //   let data = web3.utils.soliditySha3(taker)

    //   let signature = await web3.eth.sign(data, accounts[1])
      
    //   fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[3] })

    //   truffleAssert.reverts(characterGenerator.generate(
    //     tokenAddresses, 
    //     tokenQuantities,
    //     taker,
    //     signature,
    //     { from: accounts[3] }
    //   ))
    // })

    // it("Won't submit the transaction if the signed arguments don't resolve to the contract creator", async () => {
    //   let tokenAddresses = [fakeMatic.address, fakeBancor]
    //   let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10100', 'ether')]

    //   let generatorAddress = characterGenerator.address

    //   let taker = accounts[0]
      
    //   fakeMatic.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
    //   fakeBancor.approve(generatorAddress, web3.utils.toWei('10100', 'ether'), { from: accounts[0] })

    //   let data = web3.utils.soliditySha3(taker)

    //   let signature = await web3.eth.sign(data, accounts[1]) // sign with the wrong address


    //   // NOTE: Will need to sign like this in live app!
    //   // web3.eth.accounts.sign(data, private_key)

    //   truffleAssert.reverts(characterGenerator.generate(
    //     tokenAddresses, 
    //     tokenQuantities,
    //     taker,
    //     signature
    //   ))
    // })
  })

})