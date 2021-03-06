const crypto = require("crypto");
const truffleAssert = require('truffle-assertions');

const CharacterGenerator = artifacts.require("CharacterGenerator");
const Character = artifacts.require("Character");
const FakeLink = artifacts.require("FakeLink");
const FakeBancor = artifacts.require("FakeBancor");
const FakeMatic = artifacts.require("FakeMatic");

contract("CharacterGenerator", (accounts) => {
  let manager = accounts[9];
  let characterGenerator;
  let fakeLink;
  let fakeBancor;
  let fakeMatic;
  let private_key = '705f9ecaebb6707472671b86c5a309f1741b7c339e6c64dc5f02957a4d1ad533'
  let fresh_account = web3.eth.accounts.privateKeyToAccount(private_key)
  let generatorAddress;
  let now;
  let secondsSinceEpoch;
  let character;
  let nftTokenURI = 'https://www.ill.studio/abcdefg' // fake URI

  before(async () => {
    characterGenerator = await CharacterGenerator.deployed()
    character = await Character.deployed()
    
    await characterGenerator.setCharacter(character.address, { from: manager })
    await character.setGenerator(characterGenerator.address, { from: manager })

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

    now = new Date()  
    secondsSinceEpoch = Math.round(now.getTime() / 1000)
  })

  describe("Deployment", async () => {
    it("Sets the manager to be accounts[1]", async () => {
      let actualManager = await characterGenerator.manager()
      assert.equal(manager, actualManager, "Manager should be set to accounts[9]")
    })
  })

  describe("#toggleOff()", async () => {
    it("Can only be called by the manager", async () => {
      await truffleAssert.reverts(
        characterGenerator.toggleActive(true, { from: accounts[1] }),
        "Function Can Only Be Called By Contract Manager"
      )
    })
  })

  describe("#generate()", async () => {

    it("Transfers the specified quantity of each token to itself", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('3', 'ether'), web3.utils.toWei('5', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64');
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      let initialGeneratorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      initialGeneratorLinkBalance = web3.utils.fromWei(initialGeneratorLinkBalance, 'ether')

      let initialGeneratorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      initialGeneratorMaticBalance = web3.utils.fromWei(initialGeneratorMaticBalance, 'ether')

      let result = await characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities, 
        taker,
        expiration,
        nftTokenURI,
        salt,
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

    it("Generates a character NFT", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('5', 'ether'), web3.utils.toWei('1', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      let originalBalance = parseInt(await character.balanceOf(taker))

      await characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities, 
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      )

      let nftBalance = parseInt(await character.balanceOf(taker))

      assert.equal(nftBalance, originalBalance + 1)
    })

    it("Does not transfer unless ALL allowances are properly set", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('2', 'ether'), web3.utils.toWei('4', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[5] // no allowances set!
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      ), "Insufficent Allowance Provided")
    })

    it("Does not allow duplicate token sets", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('4', 'ether'), web3.utils.toWei('12', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      // submit one successful transaction
      await characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      )

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      ), "Token Combination Has Already Been Used")
    })

    it("Won't allow a transfer if the specified taker doesn't match the sender", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('3', 'ether'), web3.utils.toWei('9', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: accounts[4] } // not the taker specified in the signed message
      ), "Cannot Process Transaction Intended For Another Address")
    })

    it("Won't submit the transaction if the signed arguments don't resolve to the contract creator", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('2', 'ether'), web3.utils.toWei('1', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')

      let different_key = '61f55951fe079994b32ed41d2c7e138faf5743da532a86d79da808f0b45138c8'
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, different_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker } // not the taker specified in the signed message
      ), "Cannot Process Transaction Signed By Wrong Party")
    })

    it("Won't submit the transaction if the offer has expired", async () => {
      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('6', 'ether'), web3.utils.toWei('2', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch - 30 // set expiration in the past
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      ), "Cannot Process Transaction After It Has Expired")
    })

    it("Won't submit a transaction with duplicated salt", async () => {
      let salt = crypto.randomBytes(16).toString('base64')

      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('3', 'ether'), web3.utils.toWei('9', 'ether')]
      
      let taker = accounts[4]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker,
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      await characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      )

      tokenQuantities = [web3.utils.toWei('6', 'ether'), web3.utils.toWei('10', 'ether')]
      
      message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker,
        expiration,
        nftTokenURI,
        salt
      )

      signature = await web3.eth.accounts.sign(message, private_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      ), "Cannot Use Same Salt More Than Once")
    })

    it("Won't submit the transaction if the contract is off", async () => {
      await characterGenerator.toggleActive(false, { from: accounts[9] })

      let tokenAddresses = [fakeLink.address, fakeMatic.address]
      let tokenQuantities = [web3.utils.toWei('6', 'ether'), web3.utils.toWei('2', 'ether')]
      let salt = crypto.randomBytes(16).toString('base64')
      
      let taker = accounts[2]
      let expiration = secondsSinceEpoch + 300
      let message = web3.utils.soliditySha3(
        { type: 'address', value: tokenAddresses },
        { type: 'uint256', value: tokenQuantities },
        taker, 
        expiration,
        nftTokenURI,
        salt
      )
      let signature = await web3.eth.accounts.sign(message, private_key)

      await truffleAssert.reverts(characterGenerator.generate(
        tokenAddresses, 
        tokenQuantities,
        taker,
        expiration,
        nftTokenURI,
        salt,
        signature.signature,
        { from: taker }
      ), "Cannot Process Transaction After When Contract is Off")

      await characterGenerator.toggleActive(true, { from: accounts[9] })
    })
  })

  describe("#withdraw()", async () => {
    it("withrdaws the balance of each token", async () => {
      let generatorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      generatorLinkBalance = web3.utils.fromWei(generatorLinkBalance, 'ether')

      let generatorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      generatorMaticBalance = web3.utils.fromWei(generatorMaticBalance, 'ether')

      let generatorBancorBalance = await fakeBancor.balanceOf(generatorAddress)
      generatorBancorBalance = web3.utils.fromWei(generatorBancorBalance, 'ether')

      await characterGenerator.withdraw({ from: manager })

      let managerLinkBalance = await fakeLink.balanceOf(manager)
      managerLinkBalance = web3.utils.fromWei(managerLinkBalance, 'ether')

      let managerMaticBalance = await fakeMatic.balanceOf(manager)
      managerMaticBalance = web3.utils.fromWei(managerMaticBalance, 'ether')

      let managerBancorBalance = await fakeBancor.balanceOf(manager)
      managerBancorBalance = web3.utils.fromWei(managerBancorBalance, 'ether')

      assert.equal(managerLinkBalance, generatorLinkBalance)
      assert.equal(managerMaticBalance, generatorMaticBalance)
      assert.equal(managerBancorBalance, generatorBancorBalance)

      let finalGeneratorLinkBalance = await fakeLink.balanceOf(generatorAddress)
      let finalGeneratorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
      let finalGeneratorBancorBalance = await fakeBancor.balanceOf(generatorAddress)

      assert.equal(finalGeneratorLinkBalance, 0)
      assert.equal(finalGeneratorMaticBalance, 0)
      assert.equal(finalGeneratorBancorBalance, 0)
    })

    it("can't be called by anyone except the manager", async () => {
      await truffleAssert.reverts(characterGenerator.withdraw({ from: accounts[3] }), "Function Can Only Be Called By Contract Manager")
    })
  })

})