const FakeLink = artifacts.require("FakeLink");
const FakeBancor = artifacts.require("FakeBancor");
const FakeMatic = artifacts.require("FakeMatic");

contract("Tokens", (accounts) => {
  let owner = accounts[0]
  let fakeLink;
  let fakeBancor;
  let fakeMatic;

  before(async () => {
    fakeLink = await FakeLink.deployed();
    fakeBancor = await FakeBancor.deployed();
    fakeMatic = await FakeMatic.deployed();
  })

  describe("Deployment", async () => {
    it("gives the owner the correct token balances", async () => {
      let linkBalance = await fakeLink.balanceOf(owner);
      linkBalance = linkBalance.toNumber();
      assert.equal(1000000, linkBalance, "Should have correct fLINK balance");

      let bancorBalance = await fakeBancor.balanceOf(owner);
      bancorBalance = bancorBalance.toNumber();
      assert.equal(10000, bancorBalance, "Should have correct fBNT balance");

      let maticBalance = await fakeMatic.balanceOf(owner);
      maticBalance = maticBalance.toNumber();
      assert.equal(1000000000, maticBalance, "Should have correct fLINK balance");
    })
  })
})