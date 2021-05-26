// const truffleAssert = require('truffle-assertions');

// const CharacterGenerator = artifacts.require("CharacterGenerator");
// const FakeLink = artifacts.require("FakeLink");
// const FakeBancor = artifacts.require("FakeBancor");
// const FakeMatic = artifacts.require("FakeMatic");

// contract("CharacterGenerator", (accounts) => {
//   let receiver = accounts[1];
//   let characterGenerator;
//   let fakeLink;
//   let fakeBancor;
//   let fakeMatic;

//   before(async () => {
//     characterGenerator = await CharacterGenerator.deployed()
//     fakeLink = await FakeLink.deployed();
//     fakeBancor = await FakeBancor.deployed();
//     fakeMatic = await FakeMatic.deployed();
//   })

//   describe("Deployment", async () => {
//     it("Sets the receiver to be accounts[1]", async () => {
//       let actualReceiver = await characterGenerator.receiver()
//       assert.equal(receiver, actualReceiver, "Receiver should be set to accounts[1]")
//     })
//   })

//   describe("#generate()", async () => {

//     it("Transfers the specified quantity of each token to itself", async () => {
//       let tokenAddresses = [fakeLink.address, fakeMatic.address]
//       let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10000', 'ether')]

//       let generatorAddress = characterGenerator.address
      
//       fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
//       fakeMatic.approve(generatorAddress, web3.utils.toWei('10000', 'ether'), { from: accounts[0] })

//       let taker = accounts[0]

//       let data = web3.utils.soliditySha3(taker)
      
//       console.log(data)

//       let signature = await web3.eth.sign(data, accounts[0])

//       console.log(signature)

//       await characterGenerator.generate(tokenAddresses, tokenQuantities, taker, signature)

//       let generatorLinkBalance = await fakeLink.balanceOf(generatorAddress)
//       generatorLinkBalance = web3.utils.fromWei(generatorLinkBalance, 'ether')

//       let generatorMaticBalance = await fakeMatic.balanceOf(generatorAddress)
//       generatorMaticBalance = web3.utils.fromWei(generatorMaticBalance, 'ether')

//       assert.equal(generatorLinkBalance, 100)
//       assert.equal(generatorMaticBalance, 10000)
//     })

//     it("Does not transfer unless ALL allowances are properly set", async () => {
//       let tokenAddresses = [fakeLink.address, fakeBancor.address]
//       let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10000', 'ether')]
//       let taker = accounts[0]

//       let generatorAddress = characterGenerator.address

//       let data = web3.utils.soliditySha3(taker)

//       let signature = await web3.eth.sign(data, accounts[0])
      
//       fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
//       // don't set fBNT allowance

//       let initialLinkBalance = await fakeLink.balanceOf(generatorAddress)
//       initialLinkBalance = web3.utils.fromWei(initialLinkBalance, 'ether')

//       truffleAssert.reverts(characterGenerator.generate(
//         tokenAddresses, 
//         tokenQuantities,
//         taker,
//         signature
//       ))
//     })

//     it("Won't allow a transfer if the specified taker doesn't match the sender", async () => {
//       let tokenAddresses = [fakeLink.address]
//       let tokenQuantities = [web3.utils.toWei('100', 'ether')]
//       let taker = accounts[0] // specify the wrong taker

//       fakeLink.transfer(accounts[3], web3.utils.toWei('100', 'ether'), { from: accounts[0] })

//       let generatorAddress = characterGenerator.address

//       let data = web3.utils.soliditySha3(taker)

//       let signature = await web3.eth.sign(data, accounts[1])
      
//       fakeLink.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[3] })

//       truffleAssert.reverts(characterGenerator.generate(
//         tokenAddresses, 
//         tokenQuantities,
//         taker,
//         signature,
//         { from: accounts[3] }
//       ))
//     })

//     it("Won't submit the transaction if the signed arguments don't resolve to the contract creator", async () => {
//       let tokenAddresses = [fakeMatic.address, fakeBancor]
//       let tokenQuantities = [web3.utils.toWei('100', 'ether'), web3.utils.toWei('10100', 'ether')]

//       let generatorAddress = characterGenerator.address

//       let taker = accounts[0]
      
//       fakeMatic.approve(generatorAddress, web3.utils.toWei('100', 'ether'), { from: accounts[0] })
//       fakeBancor.approve(generatorAddress, web3.utils.toWei('10100', 'ether'), { from: accounts[0] })

//       let data = web3.utils.soliditySha3(taker)

//       let signature = await web3.eth.sign(data, accounts[1]) // sign with the wrong address


//       // NOTE: Will need to sign like this in live app!
//       // web3.eth.accounts.sign(data, private_key)

//       truffleAssert.reverts(characterGenerator.generate(
//         tokenAddresses, 
//         tokenQuantities,
//         taker,
//         signature
//       ))
//     })
//   })

// })