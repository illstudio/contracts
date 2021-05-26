const FakeLink = artifacts.require("Signer");

// contract("Tokens", (accounts) => {
//   let owner = accounts[0]
//   let fakeLink;
//   let fakeBancor;
//   let fakeMatic;

//   before(async () => {
//     fakeLink = await FakeLink.deployed();
//     fakeBancor = await FakeBancor.deployed();
//     fakeMatic = await FakeMatic.deployed();
//   })

//   describe("Deployment", async () => {
//     it("gives the owner the correct token balances", async () => {
//       let linkBalance = await fakeLink.balanceOf(owner);
//       linkBalance = web3.utils.fromWei(linkBalance, 'ether')
//       // this is currently breaking because we make a transfer in a previous test
//       // ==> fragile testing strategy
//       // assert.equal(1000000, linkBalance, "Should have correct fLINK balance");

//       let bancorBalance = await fakeBancor.balanceOf(owner);
//       bancorBalance = web3.utils.fromWei(bancorBalance, 'ether')
//       assert.equal(10000, bancorBalance, "Should have correct fBNT balance");

//       let maticBalance = await fakeMatic.balanceOf(owner);
//       maticBalance = web3.utils.fromWei(maticBalance, 'ether')
//       assert.equal(1000000000, maticBalance, "Should have correct fLINK balance");
//     })
//   })
// })